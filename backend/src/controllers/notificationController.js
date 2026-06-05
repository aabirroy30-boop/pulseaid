// src/controllers/notificationController.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse }      = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');

// ── Get My Notifications ──────────────────────────────────────────────────────
exports.getMyNotifications = async (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, unreadOnly } = req.query;

    let query = db.collection(collections.NOTIFICATIONS)
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc');

    if (unreadOnly === 'true') query = query.where('isRead', '==', false);

    const snap   = await query.get();
    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const notifications = snap.docs
      .slice(offset, offset + Number(limit))
      .map((d) => d.data());

    const unreadCount = snap.docs.filter((d) => !d.data().isRead).length;

    return successResponse(res, {
      notifications,
      unreadCount,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Notifications fetched');
  } catch (error) {
    logger.error('Get notifications error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Mark Notification Read ────────────────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const db = getDb();

    const snap = await db.collection(collections.NOTIFICATIONS).doc(notificationId).get();
    if (!snap.exists) return errorResponse(res, 'Notification not found.', 404);

    if (snap.data().userId !== req.user.uid) return errorResponse(res, 'Not authorized.', 403);

    await db.collection(collections.NOTIFICATIONS).doc(notificationId).update({
      isRead: true, readAt: serverTimestamp(),
    });

    return successResponse(res, {}, 'Notification marked as read');
  } catch (error) {
    logger.error('Mark read error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Mark All Read ─────────────────────────────────────────────────────────────
exports.markAllRead = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.NOTIFICATIONS)
      .where('userId', '==', req.user.uid)
      .where('isRead', '==', false)
      .get();

    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((d) => {
        batch.update(d.ref, { isRead: true, readAt: serverTimestamp() });
      });
      await batch.commit();
    }

    return successResponse(res, { count: snap.size }, 'All notifications marked as read');
  } catch (error) {
    logger.error('Mark all read error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete Notification ───────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const db = getDb();

    const snap = await db.collection(collections.NOTIFICATIONS).doc(notificationId).get();
    if (!snap.exists) return errorResponse(res, 'Notification not found.', 404);

    if (snap.data().userId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    await db.collection(collections.NOTIFICATIONS).doc(notificationId).delete();

    return successResponse(res, {}, 'Notification deleted');
  } catch (error) {
    logger.error('Delete notification error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Register FCM Token ────────────────────────────────────────────────────────
exports.registerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return errorResponse(res, 'FCM token is required.', 400);

    const db      = getDb();
    const { admin } = require('../config/firebase');
    await db.collection(collections.USERS).doc(req.user.uid).update({
      fcmTokens: admin.firestore.FieldValue.arrayUnion(fcmToken),
      updatedAt: serverTimestamp(),
    });

    return successResponse(res, {}, 'FCM token registered');
  } catch (error) {
    logger.error('Register FCM token error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Admin: Broadcast Notification ────────────────────────────────────────────
exports.broadcastNotification = async (req, res) => {
  try {
    const { title, body, targetRole, data } = req.body;
    const db = getDb();

    let query = db.collection(collections.USERS);
    if (targetRole) query = query.where('role', '==', targetRole);

    const snap = await query.get();
    let sent   = 0;

    for (const doc of snap.docs) {
      try {
        await notificationService.sendToUser(doc.id, { title, body, data: data || {} });
        sent++;
      } catch (_) {}
    }

    return successResponse(res, { sent }, 'Broadcast sent');
  } catch (error) {
    logger.error('Broadcast notification error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Send Custom Notification ──────────────────────────────────────────────────
exports.sendCustomNotification = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    await notificationService.sendToUser(userId, { title, body, data: data || {} });

    return successResponse(res, {}, 'Notification sent');
  } catch (error) {
    logger.error('Send custom notification error:', error);
    return errorResponse(res, error.message, 500);
  }
};