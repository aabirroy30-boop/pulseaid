// src/controllers/authController.js
'use strict';

const { getAuth, getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      name, email, phone, password, role,
      bloodGroup, address, latitude, longitude,
      organizationName, registrationNumber,
    } = req.body;

    const db           = getDb();
    const firebaseAuth = getAuth();

    // Create Firebase Auth user
    const firebaseUser = await firebaseAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone ? `+91${phone}` : undefined,
    });

    const uid = firebaseUser.uid;

    // Set custom claims (role) so frontend can read role from token
    await firebaseAuth.setCustomUserClaims(uid, { role });

    // Base user document in Firestore
    const userDoc = {
      uid,
      name,
      email,
      phone:      phone || null,
      role,
      bloodGroup: bloodGroup || null,
      address:    address || null,
      latitude:   latitude || null,
      longitude:  longitude || null,
      isVerified: role === 'user',
      isBlocked:  false,
      fcmTokens:  [],
      createdAt:  serverTimestamp(),
      updatedAt:  serverTimestamp(),
    };

    // Organisation-specific fields
    if (['hospital', 'ngo', 'blood_bank'].includes(role)) {
      userDoc.organizationName   = organizationName || name;
      userDoc.registrationNumber = registrationNumber || null;
      userDoc.isVerified         = false;
    }

    await db.collection(collections.USERS).doc(uid).set(userDoc);

    // If donor, create donor profile
    if (role === 'donor') {
      await db.collection(collections.DONORS).doc(uid).set({
        uid,
        name,
        email,
        phone:           phone || null,
        bloodGroup:      bloodGroup || null,
        address:         address || null,
        latitude:        latitude || null,
        longitude:       longitude || null,
        totalDonations:  0,
        livesSaved:      0,
        rating:          0,
        ratingCount:     0,
        isAvailable:     true,
        isVerified:      false,
        lastDonationDate: null,
        createdAt:       serverTimestamp(),
        updatedAt:       serverTimestamp(),
      });
    }

    return successResponse(
      res,
      {
        user: { uid, name, email, phone, role, bloodGroup, isVerified: userDoc.isVerified },
        message: 'Registration successful. Please login via the app to get your token.',
      },
      'Registration successful',
      201
    );
  } catch (error) {
    logger.error('Register error:', error);

    // Firebase Auth specific errors
    if (error.code === 'auth/email-already-exists') {
      return errorResponse(res, 'Email already registered.', 409);
    }
    if (error.code === 'auth/invalid-password') {
      return errorResponse(res, 'Password must be at least 6 characters.', 400);
    }
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Profile ───────────────────────────────────────────────────────────────
// (Login is handled by Firebase on the FRONTEND - no login endpoint needed)
exports.getProfile = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.USERS).doc(req.user.uid).get();

    if (!snap.exists) return errorResponse(res, 'User not found.', 404);

    const { fcmTokens, ...safeUser } = snap.data();
    return successResponse(res, { user: safeUser }, 'Profile fetched');
  } catch (error) {
    logger.error('Get profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const db = getDb();
    const allowedFields = [
      'name', 'phone', 'address', 'latitude', 'longitude',
      'bloodGroup', 'profileImage', 'organizationName',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = serverTimestamp();

    await db.collection(collections.USERS).doc(req.user.uid).update(updates);

    // Sync Firebase Auth display name if name changed
    if (updates.name) {
      await getAuth().updateUser(req.user.uid, { displayName: updates.name });
    }

    // Sync donor profile
    if (req.user.role === 'donor') {
      const donorUpdates = {};
      ['name', 'phone', 'address', 'latitude', 'longitude', 'bloodGroup'].forEach((f) => {
        if (updates[f] !== undefined) donorUpdates[f] = updates[f];
      });
      if (Object.keys(donorUpdates).length) {
        donorUpdates.updatedAt = serverTimestamp();
        await db.collection(collections.DONORS).doc(req.user.uid).update(donorUpdates);
      }
    }

    return successResponse(res, {}, 'Profile updated');
  } catch (error) {
    logger.error('Update profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete Account ────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const db = getDb();

    // Delete from Firebase Auth
    await getAuth().deleteUser(req.user.uid);

    // Soft delete from Firestore
    await db.collection(collections.USERS).doc(req.user.uid).update({
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });

    return successResponse(res, {}, 'Account deleted');
  } catch (error) {
    logger.error('Delete account error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Logout (revoke tokens) ────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const db = getDb();

    // Revoke all refresh tokens
    await getAuth().revokeRefreshTokens(req.user.uid);

    // Remove FCM token
    if (fcmToken) {
      const { admin } = require('../config/firebase');
      await db.collection(collections.USERS).doc(req.user.uid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(fcmToken),
      });
    }

    return successResponse(res, {}, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get All Users (Admin) ─────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const db = getDb();
    const { role, isVerified, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.USERS).orderBy('createdAt', 'desc');
    if (role)       query = query.where('role', '==', role);
    if (isVerified !== undefined) {
      query = query.where('isVerified', '==', isVerified === 'true');
    }

    const snap  = await query.get();
    const total = snap.size;
    const offset = (page - 1) * limit;
    const users  = snap.docs.slice(offset, offset + Number(limit)).map((d) => {
      const { fcmTokens, ...u } = d.data();
      return u;
    });

    return successResponse(res, {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    }, 'Users fetched');
  } catch (error) {
    logger.error('Get all users error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Block / Unblock User (Admin) ──────────────────────────────────────────────
exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db         = getDb();
    const snap       = await db.collection(collections.USERS).doc(userId).get();

    if (!snap.exists) return errorResponse(res, 'User not found.', 404);

    const current = snap.data().isBlocked;

    // Disable/enable in Firebase Auth too
    await getAuth().updateUser(userId, { disabled: !current });

    await db.collection(collections.USERS).doc(userId).update({
      isBlocked: !current,
      updatedAt: serverTimestamp(),
    });

    return successResponse(res, { isBlocked: !current },
      `User ${!current ? 'blocked' : 'unblocked'}`);
  } catch (error) {
    logger.error('Toggle block user error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Verify User (Admin) ───────────────────────────────────────────────────────
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db         = getDb();

    await db.collection(collections.USERS).doc(userId).update({
      isVerified: true,
      updatedAt:  serverTimestamp(),
    });

    const userSnap = await db.collection(collections.USERS).doc(userId).get();
    if (userSnap.data()?.role === 'donor') {
      await db.collection(collections.DONORS).doc(userId).update({ isVerified: true });
    }

    return successResponse(res, {}, 'User verified successfully');
  } catch (error) {
    logger.error('Verify user error:', error);
    return errorResponse(res, error.message, 500);
  }
};