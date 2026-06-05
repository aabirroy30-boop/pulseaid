// src/controllers/organizationController.js
'use strict';

const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

// ── Get All Organizations ─────────────────────────────────────────────────────
exports.getAllOrganizations = async (req, res) => {
  try {
    const db = getDb();
    const { type, isVerified, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.USERS)
      .where('role', 'in', ['hospital', 'ngo', 'blood_bank'])
      .orderBy('createdAt', 'desc');

    if (type)                     query = query.where('role',       '==', type);
    if (isVerified !== undefined) query = query.where('isVerified', '==', isVerified === 'true');

    const snap   = await query.get();
    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const orgs   = snap.docs.slice(offset, offset + Number(limit)).map((d) => {
      const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = d.data();
      return safe;
    });

    return paginatedResponse(
      res,
      orgs,
      { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      'Organizations fetched'
    );
  } catch (error) {
    logger.error('Get all orgs error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Single Organization ───────────────────────────────────────────────────
exports.getOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;
    const db        = getDb();
    const snap      = await db.collection(collections.USERS).doc(orgId).get();

    if (!snap.exists) return errorResponse(res, 'Organization not found.', 404);

    const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = snap.data();
    return successResponse(res, { organization: safe }, 'Organization fetched');
  } catch (error) {
    logger.error('Get org error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Find Nearby Organizations ─────────────────────────────────────────────────
exports.findNearbyOrganizations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20, type } = req.query;
    if (!latitude || !longitude) return errorResponse(res, 'Coordinates required.', 400);

    const db  = getDb();
    let query = db.collection(collections.USERS)
      .where('isVerified', '==', true);

    if (type) {
      query = query.where('role', '==', type);
    } else {
      query = query.where('role', 'in', ['hospital', 'ngo', 'blood_bank']);
    }

    const snap = await query.get();
    const lat  = parseFloat(latitude);
    const lng  = parseFloat(longitude);
    const rad  = parseFloat(radius);

    const orgs = snap.docs
      .map((d) => {
        const { passwordHash, refreshTokenHash, fcmTokens, ...safe } = d.data();
        return safe;
      })
      .filter((o) => o.latitude && o.longitude)
      .map((o) => ({
        ...o,
        distance: parseFloat(haversine(lat, lng, o.latitude, o.longitude).toFixed(2)),
      }))
      .filter((o) => o.distance <= rad)
      .sort((a, b) => a.distance - b.distance);

    return successResponse(res, { organizations: orgs, total: orgs.length }, 'Nearby organizations fetched');
  } catch (error) {
    logger.error('Find nearby orgs error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Organization Profile ───────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const db = getDb();
    const allowed = ['organizationName', 'address', 'latitude', 'longitude', 'phone', 'website', 'description'];
    const updates  = {};

    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    updates.updatedAt = serverTimestamp();

    await db.collection(collections.USERS).doc(req.user.uid).update(updates);

    return successResponse(res, {}, 'Organization profile updated');
  } catch (error) {
    logger.error('Update org profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Organization's Request History ────────────────────────────────────────
exports.getRequestHistory = async (req, res) => {
  try {
    const orgId = req.params.orgId || req.user.uid;
    const db    = getDb();
    const { page = 1, limit = 20, status } = req.query;

    if (req.user.role !== 'admin' && orgId !== req.user.uid) {
      return errorResponse(res, 'Not authorized.', 403);
    }

    let query = db.collection(collections.REQUESTS)
      .where('requestedBy', '==', orgId)
      .orderBy('createdAt', 'desc');

    if (status) query = query.where('status', '==', status);

    const snap   = await query.get();
    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const requests = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data());

    return paginatedResponse(
      res,
      requests,
      { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      'Request history fetched'
    );
  } catch (error) {
    logger.error('Get org request history error:', error);
    return errorResponse(res, error.message, 500);
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}