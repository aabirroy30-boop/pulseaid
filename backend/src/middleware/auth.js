// src/middleware/auth.js
'use strict';

const { getAuth, getDb, collections } = require('../config/firebase');
const { errorResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

/**
 * Verify Firebase ID Token sent from frontend.
 * Frontend sends: Authorization: Bearer <firebase_id_token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const idToken = authHeader.split(' ')[1];

    // Verify token with Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Fetch user data from Firestore
    const db = getDb();
    const userSnap = await db
      .collection(collections.USERS)
      .doc(decodedToken.uid)
      .get();

    if (!userSnap.exists) {
      return errorResponse(res, 'User not found.', 401);
    }

    const userData = userSnap.data();

    if (userData.isBlocked) {
      return errorResponse(res, 'Account suspended. Contact support.', 403);
    }

    req.user = {
      uid:        decodedToken.uid,
      email:      userData.email,
      role:       userData.role,
      name:       userData.name,
      bloodGroup: userData.bloodGroup || null,
      isVerified: userData.isVerified || false,
    };

    next();
  } catch (error) {
    logger.warn(`Firebase Auth middleware error: ${error.message}`);

    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 'Token expired. Please log in again.', 401);
    }
    if (error.code === 'auth/argument-error' ||
        error.code === 'auth/id-token-revoked') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 401);
  }
};

/**
 * Optional auth – attaches user if token exists, does NOT block request.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const idToken     = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const db          = getDb();
    const snap        = await db
      .collection(collections.USERS)
      .doc(decodedToken.uid)
      .get();

    if (snap.exists && !snap.data().isBlocked) {
      req.user = { uid: decodedToken.uid, ...snap.data() };
    }
  } catch (_) { /* ignore */ }

  next();
};

module.exports = { authenticate, optionalAuth };