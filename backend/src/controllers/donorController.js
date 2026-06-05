// src/controllers/donorController.js
'use strict';

const { getDb, collections, serverTimestamp, increment } = require('../config/firebase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const donorMatchingService = require('../services/donorMatchingService');

// ── Get All Donors ─────────────────────────────────────────────────────────────
exports.getAllDonors = async (req, res) => {
  try {
    const db = getDb();
    const { bloodGroup, isAvailable, isVerified, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.DONORS).orderBy('createdAt', 'desc');

    if (bloodGroup)              query = query.where('bloodGroup',   '==', bloodGroup);
    if (isAvailable !== undefined) query = query.where('isAvailable', '==', isAvailable === 'true');
    if (isVerified !== undefined)  query = query.where('isVerified',  '==', isVerified  === 'true');

    const snap  = await query.get();
    const total = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const donors = snap.docs
      .slice(offset, offset + Number(limit))
      .map((d) => {
        const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = d.data();
        return safe;
      });

    return paginatedResponse(
      res,
      donors,
      { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      'Donors fetched'
    );
  } catch (error) {
    logger.error('Get all donors error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Donor by ID ────────────────────────────────────────────────────────────
exports.getDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const db = getDb();
    const snap = await db.collection(collections.DONORS).doc(donorId).get();

    if (!snap.exists) return errorResponse(res, 'Donor not found.', 404);

    const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = snap.data();
    return successResponse(res, { donor: safe }, 'Donor fetched');
  } catch (error) {
    logger.error('Get donor error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get My Donor Profile ───────────────────────────────────────────────────────
exports.getMyDonorProfile = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.DONORS).doc(req.user.uid).get();

    if (!snap.exists) return errorResponse(res, 'Donor profile not found.', 404);

    return successResponse(res, { donor: snap.data() }, 'Donor profile fetched');
  } catch (error) {
    logger.error('Get my donor profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Donor Availability ─────────────────────────────────────────────────
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const db = getDb();

    await db.collection(collections.DONORS).doc(req.user.uid).update({
      isAvailable: Boolean(isAvailable),
      updatedAt:   serverTimestamp(),
    });

    return successResponse(res, { isAvailable }, 'Availability updated');
  } catch (error) {
    logger.error('Update availability error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Donor Location ─────────────────────────────────────────────────────
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const db = getDb();

    const updates = {
      latitude:  parseFloat(latitude),
      longitude: parseFloat(longitude),
      updatedAt: serverTimestamp(),
    };
    if (address) updates.address = address;

    await db.collection(collections.DONORS).doc(req.user.uid).update(updates);
    await db.collection(collections.USERS).doc(req.user.uid).update({
      latitude:  updates.latitude,
      longitude: updates.longitude,
      updatedAt: serverTimestamp(),
    });

    return successResponse(res, {}, 'Location updated');
  } catch (error) {
    logger.error('Update donor location error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Find Nearest Donors ────────────────────────────────────────────────────────
exports.findNearestDonors = async (req, res) => {
  try {
    const { bloodGroup, latitude, longitude, radius = 10, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return errorResponse(res, 'latitude and longitude are required.', 400);
    }

    const donors = await donorMatchingService.findNearestDonors({
      bloodGroup,
      latitude:  parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius:    parseFloat(radius),
      limit:     parseInt(limit),
    });

    return successResponse(res, { donors, total: donors.length }, 'Nearest donors found');
  } catch (error) {
    logger.error('Find nearest donors error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Rate Donor ────────────────────────────────────────────────────────────────
exports.rateDonor = async (req, res) => {
  try {
    const { donorId }             = req.params;
    const { rating, requestId }   = req.body;  // rating: 1–5
    const db                      = getDb();

    if (rating < 1 || rating > 5) return errorResponse(res, 'Rating must be 1–5.', 400);

    const snap = await db.collection(collections.DONORS).doc(donorId).get();
    if (!snap.exists) return errorResponse(res, 'Donor not found.', 404);

    const donor     = snap.data();
    const newCount  = (donor.ratingCount || 0) + 1;
    const newRating = ((donor.rating || 0) * (donor.ratingCount || 0) + rating) / newCount;

    await db.collection(collections.DONORS).doc(donorId).update({
      rating:      parseFloat(newRating.toFixed(2)),
      ratingCount: newCount,
      updatedAt:   serverTimestamp(),
    });

    return successResponse(res, { rating: newRating, ratingCount: newCount }, 'Donor rated');
  } catch (error) {
    logger.error('Rate donor error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Donor's Donation History ──────────────────────────────────────────────
exports.getDonationHistory = async (req, res) => {
  try {
    const donorId = req.params.donorId || req.user.uid;
    const db      = getDb();
    const { page = 1, limit = 20 } = req.query;

    const snap = await db.collection(collections.REQUESTS)
      .where('donorIds', 'array-contains', donorId)
      .where('status', '==', 'fulfilled')
      .orderBy('createdAt', 'desc')
      .get();

    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const history = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data());

    return paginatedResponse(
      res,
      history,
      { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      'Donation history fetched'
    );
  } catch (error) {
    logger.error('Get donation history error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Admin: Verify Donor ───────────────────────────────────────────────────────
exports.verifyDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { action }  = req.body; // 'verify' | 'reject'
    const db          = getDb();

    const snap = await db.collection(collections.DONORS).doc(donorId).get();
    if (!snap.exists) return errorResponse(res, 'Donor not found.', 404);

    const isVerified = action === 'verify';

    await db.collection(collections.DONORS).doc(donorId).update({ isVerified, updatedAt: serverTimestamp() });
    await db.collection(collections.USERS).doc(donorId).update({ isVerified, updatedAt: serverTimestamp() });

    const notificationService = require('../services/notificationService');
    await notificationService.sendToUser(donorId, {
      title: isVerified ? '✅ Account Verified' : '❌ Verification Rejected',
      body:  isVerified
        ? 'Your donor account has been verified. You can now accept donation requests.'
        : 'Your donor verification was rejected. Please contact support.',
      data: { type: 'account_verification', status: action },
    });

    return successResponse(res, { donorId, isVerified }, `Donor ${action}ed`);
  } catch (error) {
    logger.error('Verify donor error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Saved Donors (User's saved list) ─────────────────────────────────────
exports.getSavedDonors = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.USERS).doc(req.user.uid).get();

    if (!snap.exists) return errorResponse(res, 'User not found.', 404);

    const savedDonorIds = snap.data().savedDonors || [];

    if (savedDonorIds.length === 0) {
      return successResponse(res, { donors: [] }, 'No saved donors');
    }

    const donorSnaps = await Promise.all(
      savedDonorIds.map((id) => db.collection(collections.DONORS).doc(id).get())
    );

    const donors = donorSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = d.data();
        return safe;
      });

    return successResponse(res, { donors }, 'Saved donors fetched');
  } catch (error) {
    logger.error('Get saved donors error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Save / Unsave Donor ───────────────────────────────────────────────────────
exports.toggleSaveDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const db          = getDb();
    const { admin }   = require('../config/firebase');

    const snap     = await db.collection(collections.USERS).doc(req.user.uid).get();
    const saved    = snap.data().savedDonors || [];
    const isSaved  = saved.includes(donorId);

    const update = isSaved
      ? { savedDonors: admin.firestore.FieldValue.arrayRemove(donorId) }
      : { savedDonors: admin.firestore.FieldValue.arrayUnion(donorId) };

    await db.collection(collections.USERS).doc(req.user.uid).update(update);

    return successResponse(res, { saved: !isSaved }, isSaved ? 'Donor removed from saved' : 'Donor saved');
  } catch (error) {
    logger.error('Toggle save donor error:', error);
    return errorResponse(res, error.message, 500);
  }
};