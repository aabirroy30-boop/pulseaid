// src/sockets/notificationHandler.js
'use strict';

const { getDb, collections } = require('../config/firebase');
const { logger }             = require('../utils/logger');

/**
 * Register notification-related Socket.io events on a connected socket.
 *
 * Supported events (client → server):
 *   notification:mark_read    { notificationId }
 *   notification:mark_all_read
 *   notification:get_unread_count
 *
 * Emitted events (server → client):
 *   notification              { title, body, data }          (from notificationService)
 *   notification:unread_count { count }
 */
const registerNotifHandlers = (io, socket) => {
  // ── On connect: immediately push unread count ───────────────────────────
  socket.on('notification:get_unread_count', async () => {
    try {
      const db   = getDb();
      const snap = await db.collection(collections.NOTIFICATIONS)
        .where('userId', '==', socket.userId)
        .where('isRead', '==', false)
        .get();

      socket.emit('notification:unread_count', { count: snap.size });
    } catch (err) {
      logger.error('notification:get_unread_count error:', err);
    }
  });

  // ── Mark a single notification read ────────────────────────────────────
  socket.on('notification:mark_read', async ({ notificationId }) => {
    try {
      if (!notificationId) return;

      const db   = getDb();
      const snap = await db.collection(collections.NOTIFICATIONS).doc(notificationId).get();

      if (!snap.exists || snap.data().userId !== socket.userId) return;

      await db.collection(collections.NOTIFICATIONS).doc(notificationId).update({
        isRead: true,
        readAt: new Date().toISOString(),
      });

      // Refresh unread count
      const unread = await db.collection(collections.NOTIFICATIONS)
        .where('userId', '==', socket.userId)
        .where('isRead', '==', false)
        .get();

      socket.emit('notification:unread_count', { count: unread.size });
    } catch (err) {
      logger.error('notification:mark_read error:', err);
    }
  });

  // ── Mark all notifications read ─────────────────────────────────────────
  socket.on('notification:mark_all_read', async () => {
    try {
      const db   = getDb();
      const snap = await db.collection(collections.NOTIFICATIONS)
        .where('userId', '==', socket.userId)
        .where('isRead', '==', false)
        .get();

      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((d) =>
          batch.update(d.ref, { isRead: true, readAt: new Date().toISOString() })
        );
        await batch.commit();
      }

      socket.emit('notification:unread_count', { count: 0 });
    } catch (err) {
      logger.error('notification:mark_all_read error:', err);
    }
  });
};

module.exports = registerNotifHandlers;