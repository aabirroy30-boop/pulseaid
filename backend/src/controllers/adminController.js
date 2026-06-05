// src/controllers/adminController.js
'use strict';

const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse }      = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');

// ── Get All Donors for Verification ──────────────────────────────────────────
exports.getPendingDonors = async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection(collections.DONORS)
      .where('isVerified', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const donors = snap.docs.map((d) => {
      const { passwordHash, refreshTokenHash, ...safe } = d.data();
      return safe;
    });

    return successResponse(res, { donors, total: donors.length }, 'Pending donors fetched');
  } catch (error) {
    logger.error('Get pending donors error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Pending Organizations ─────────────────────────────────────────────────
exports.getPendingOrganizations = async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection(collections.USERS)
      .where('role', 'in', ['hospital', 'ngo', 'blood_bank'])
      .where('isVerified', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    const orgs = snap.docs.map((d) => {
      const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = d.data();
      return safe;
    });

    return successResponse(res, { organizations: orgs, total: orgs.length }, 'Pending orgs fetched');
  } catch (error) {
    logger.error('Get pending orgs error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Verify / Reject Entity ────────────────────────────────────────────────────
exports.verifyEntity = async (req, res) => {
  try {
    const { entityId }            = req.params;
    const { action, rejectReason } = req.body;  // action: 'verify' | 'reject'
    const db = getDb();

    const snap = await db.collection(collections.USERS).doc(entityId).get();
    if (!snap.exists) return errorResponse(res, 'Entity not found.', 404);

    const user       = snap.data();
    const isVerified = action === 'verify';

    await db.collection(collections.USERS).doc(entityId).update({
      isVerified,
      verifiedAt:    isVerified ? serverTimestamp() : null,
      rejectedAt:    !isVerified ? serverTimestamp() : null,
      rejectReason:  !isVerified ? (rejectReason || '') : null,
      updatedAt:     serverTimestamp(),
    });

    // Sync donor profile if applicable
    if (user.role === 'donor') {
      await db.collection(collections.DONORS).doc(entityId).update({ isVerified, updatedAt: serverTimestamp() });
    }

    await notificationService.sendToUser(entityId, {
      title: isVerified ? '✅ Account Verified!' : '❌ Verification Rejected',
      body:  isVerified
        ? 'Your account has been verified. Welcome to PulseAid!'
        : `Verification rejected. Reason: ${rejectReason || 'Contact support'}`,
      data: { type: 'verification', status: action },
    });

    return successResponse(res, { entityId, isVerified }, `Entity ${action}ed`);
  } catch (error) {
    logger.error('Verify entity error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get All Requests (Admin) ──────────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const db = getDb();
    const { status, bloodGroup, requestType, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.REQUESTS).orderBy('createdAt', 'desc');
    if (status)      query = query.where('status', '==', status);
    if (bloodGroup)  query = query.where('bloodGroup', '==', bloodGroup);
    if (requestType) query = query.where('requestType', '==', requestType);

    const snap   = await query.get();
    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const requests = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data());

    return successResponse(res, {
      requests,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'All requests fetched');
  } catch (error) {
    logger.error('Admin get all requests error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Dashboard Recent Activity ─────────────────────────────────────────────────
exports.getRecentActivity = async (req, res) => {
  try {
    const db    = getDb();
    const limit = parseInt(req.query.limit) || 20;

    const [usersSnap, requestsSnap] = await Promise.all([
      db.collection(collections.USERS).orderBy('createdAt', 'desc').limit(limit).get(),
      db.collection(collections.REQUESTS).orderBy('createdAt', 'desc').limit(limit).get(),
    ]);

    const activities = [];

    usersSnap.docs.forEach((d) => {
      const u = d.data();
      activities.push({
        type:      'user_registered',
        message:   `New ${u.role} registered: ${u.name}`,
        userId:    u.uid,
        location:  u.address,
        createdAt: u.createdAt,
      });
    });

    requestsSnap.docs.forEach((d) => {
      const r = d.data();
      activities.push({
        type:      'blood_request',
        message:   `New ${r.requestType} request: ${r.bloodGroup} (${r.units} units) at ${r.hospitalName}`,
        requestId: r.requestId,
        createdAt: r.createdAt,
      });
    });

    activities.sort((a, b) => {
      const ta = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const tb = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return tb - ta;
    });

    return successResponse(res, { activities: activities.slice(0, limit) }, 'Recent activity fetched');
  } catch (error) {
    logger.error('Get recent activity error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Manage Settings ───────────────────────────────────────────────────────────
exports.getSettings = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection('app_settings').doc('global').get();

    return successResponse(res, { settings: snap.exists ? snap.data() : {} }, 'Settings fetched');
  } catch (error) {
    logger.error('Get settings error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const db       = getDb();
    const settings = req.body;

    await db.collection('app_settings').doc('global').set({
      ...settings,
      updatedAt:  serverTimestamp(),
      updatedBy:  req.user.uid,
    }, { merge: true });

    return successResponse(res, {}, 'Settings updated');
  } catch (error) {
    logger.error('Update settings error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete User (Admin) ───────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const db         = getDb();

    // Soft-delete: mark as deleted
    await db.collection(collections.USERS).doc(userId).update({
      isDeleted:  true,
      deletedAt:  serverTimestamp(),
      deletedBy:  req.user.uid,
    });

    // Remove donor profile if exists
    const donorSnap = await db.collection(collections.DONORS).doc(userId).get();
    if (donorSnap.exists) {
      await db.collection(collections.DONORS).doc(userId).update({ isDeleted: true });
    }

    return successResponse(res, {}, 'User deleted');
  } catch (error) {
    logger.error('Delete user error:', error);
    return errorResponse(res, error.message, 500);
  }
};