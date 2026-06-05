// src/controllers/trackingController.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse }      = require('../utils/apiResponse');
const { logger }    = require('../utils/logger');
const { emitToUser, emitToRoom } = require('../config/socket');
const mapsService   = require('../services/mapsService');

// ── Start Tracking Session ────────────────────────────────────────────────────
exports.startTracking = async (req, res) => {
  try {
    const { requestId, targetUserId } = req.body;
    const db      = getDb();
    const session = uuidv4();

    const trackingDoc = {
      sessionId:       session,
      requestId:       requestId || null,
      trackingUserId:  req.user.uid,       // the donor being tracked
      trackedBy:       [targetUserId],      // who can see the location
      currentLocation: null,
      isActive:        true,
      startedAt:       serverTimestamp(),
      updatedAt:       serverTimestamp(),
    };

    await db.collection(collections.LOCATIONS).doc(session).set(trackingDoc);

    // Notify the viewer
    if (targetUserId) {
      emitToUser(targetUserId, 'tracking_started', {
        sessionId: session,
        donorId:   req.user.uid,
        donorName: req.user.name,
      });
    }

    return successResponse(res, { sessionId: session }, 'Tracking session started', 201);
  } catch (error) {
    logger.error('Start tracking error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Location ───────────────────────────────────────────────────────────
exports.updateLocation = async (req, res) => {
  try {
    const { sessionId }             = req.params;
    const { latitude, longitude, heading, speed } = req.body;
    const db                        = getDb();

    const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();
    if (!snap.exists) return errorResponse(res, 'Tracking session not found.', 404);

    const session = snap.data();
    if (session.trackingUserId !== req.user.uid) {
      return errorResponse(res, 'Not authorized to update this session.', 403);
    }

    const location = {
      latitude:  parseFloat(latitude),
      longitude: parseFloat(longitude),
      heading:   heading || null,
      speed:     speed || null,
      timestamp: new Date().toISOString(),
    };

    await db.collection(collections.LOCATIONS).doc(sessionId).update({
      currentLocation: location,
      updatedAt:       serverTimestamp(),
    });

    // Broadcast to all watchers
    const payload = {
      sessionId,
      donorId:  req.user.uid,
      location,
    };

    emitToRoom(`tracking:${sessionId}`, 'location_updated', payload);

    for (const watcherId of session.trackedBy || []) {
      emitToUser(watcherId, 'location_updated', payload);
    }

    return successResponse(res, { location }, 'Location updated');
  } catch (error) {
    logger.error('Update location error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Tracking Session ──────────────────────────────────────────────────────
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db            = getDb();

    const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();
    if (!snap.exists) return errorResponse(res, 'Session not found.', 404);

    const session = snap.data();
    const canView =
      session.trackingUserId === req.user.uid ||
      session.trackedBy.includes(req.user.uid) ||
      req.user.role === 'admin';

    if (!canView) return errorResponse(res, 'Not authorized.', 403);

    return successResponse(res, { session }, 'Session fetched');
  } catch (error) {
    logger.error('Get session error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Stop Tracking ─────────────────────────────────────────────────────────────
exports.stopTracking = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const db            = getDb();

    const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();
    if (!snap.exists) return errorResponse(res, 'Session not found.', 404);

    const session = snap.data();
    if (session.trackingUserId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    await db.collection(collections.LOCATIONS).doc(sessionId).update({
      isActive:  false,
      endedAt:   serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    emitToRoom(`tracking:${sessionId}`, 'tracking_stopped', { sessionId });
    for (const watcherId of session.trackedBy || []) {
      emitToUser(watcherId, 'tracking_stopped', { sessionId });
    }

    return successResponse(res, {}, 'Tracking stopped');
  } catch (error) {
    logger.error('Stop tracking error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Directions (Google Maps) ──────────────────────────────────────────────
exports.getDirections = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, mode = 'driving' } = req.query;

    if (!originLat || !originLng || !destLat || !destLng) {
      return errorResponse(res, 'Origin and destination coordinates required.', 400);
    }

    const directions = await mapsService.getDirections({
      origin:      { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      destination: { lat: parseFloat(destLat),   lng: parseFloat(destLng) },
      mode,
    });

    return successResponse(res, { directions }, 'Directions fetched');
  } catch (error) {
    logger.error('Get directions error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Estimated Time of Arrival ─────────────────────────────────────────────────
exports.getETA = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;

    const eta = await mapsService.getETA(
      { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      { lat: parseFloat(destLat),   lng: parseFloat(destLng) }
    );

    return successResponse(res, { eta }, 'ETA calculated');
  } catch (error) {
    logger.error('Get ETA error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Geocode Address ───────────────────────────────────────────────────────────
exports.geocode = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return errorResponse(res, 'Address is required.', 400);

    const result = await mapsService.geocodeAddress(address);
    return successResponse(res, result, 'Address geocoded');
  } catch (error) {
    logger.error('Geocode error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Reverse Geocode ───────────────────────────────────────────────────────────
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return errorResponse(res, 'lat and lng required.', 400);

    const result = await mapsService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    return successResponse(res, result, 'Reverse geocode successful');
  } catch (error) {
    logger.error('Reverse geocode error:', error);
    return errorResponse(res, error.message, 500);
  }
};