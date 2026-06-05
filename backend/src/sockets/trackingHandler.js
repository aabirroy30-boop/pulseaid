// src/sockets/trackingHandler.js
'use strict';

const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { logger } = require('../utils/logger');

/**
 * Register live GPS tracking Socket.io events on a connected socket.
 *
 * Supported events (client → server):
 *   tracking:start       { requestId, targetUserIds[] }
 *   tracking:update      { sessionId, latitude, longitude, heading?, speed? }
 *   tracking:watch       { sessionId }   – viewer joins the session room
 *   tracking:unwatch     { sessionId }
 *   tracking:stop        { sessionId }
 *
 * Emitted events (server → client):
 *   tracking:started     { sessionId, donorId, donorName }
 *   tracking:location    { sessionId, donorId, location }
 *   tracking:stopped     { sessionId }
 *   tracking:error       { message }
 */
const registerTrackingHandlers = (io, socket) => {
  // ── Start a tracking session ────────────────────────────────────────────
  socket.on('tracking:start', async ({ requestId, targetUserIds = [] }) => {
    try {
      const sessionId = `track_${Date.now()}_${socket.userId.slice(0, 6)}`;
      const db        = getDb();

      const doc = {
        sessionId,
        requestId:       requestId || null,
        trackingUserId:  socket.userId,
        trackedBy:       targetUserIds,
        currentLocation: null,
        isActive:        true,
        startedAt:       serverTimestamp(),
        updatedAt:       serverTimestamp(),
      };

      await db.collection(collections.LOCATIONS).doc(sessionId).set(doc);

      // Donor joins their own tracking room
      socket.join(`tracking:${sessionId}`);

      // Notify each target viewer
      for (const viewerId of targetUserIds) {
        io.to(`user:${viewerId}`).emit('tracking:started', {
          sessionId,
          donorId:   socket.userId,
          donorName: socket.user?.name || '',
        });
      }

      socket.emit('tracking:started', {
        sessionId,
        donorId:   socket.userId,
        donorName: socket.user?.name || '',
      });

      logger.info(`Tracking started: session=${sessionId} donor=${socket.userId}`);
    } catch (err) {
      logger.error('tracking:start error:', err);
      socket.emit('tracking:error', { message: 'Failed to start tracking session' });
    }
  });

  // ── Push a location update ──────────────────────────────────────────────
  socket.on('tracking:update', async ({ sessionId, latitude, longitude, heading, speed }) => {
    try {
      if (!sessionId || latitude == null || longitude == null) {
        socket.emit('tracking:error', { message: 'sessionId, latitude and longitude are required' });
        return;
      }

      const db   = getDb();
      const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();

      if (!snap.exists) {
        socket.emit('tracking:error', { message: 'Session not found' });
        return;
      }

      const session = snap.data();

      if (session.trackingUserId !== socket.userId) {
        socket.emit('tracking:error', { message: 'Not authorized to update this session' });
        return;
      }

      if (!session.isActive) {
        socket.emit('tracking:error', { message: 'Session has ended' });
        return;
      }

      const location = {
        latitude:  parseFloat(latitude),
        longitude: parseFloat(longitude),
        heading:   heading != null ? parseFloat(heading) : null,
        speed:     speed   != null ? parseFloat(speed)   : null,
        timestamp: new Date().toISOString(),
      };

      await db.collection(collections.LOCATIONS).doc(sessionId).update({
        currentLocation: location,
        updatedAt:       serverTimestamp(),
      });

      const payload = { sessionId, donorId: socket.userId, location };

      // Broadcast to the session room (watchers who called tracking:watch)
      io.to(`tracking:${sessionId}`).emit('tracking:location', payload);

      // Also push to each individually registered viewer
      for (const viewerId of (session.trackedBy || [])) {
        io.to(`user:${viewerId}`).emit('tracking:location', payload);
      }
    } catch (err) {
      logger.error('tracking:update error:', err);
    }
  });

  // ── Join as a watcher ───────────────────────────────────────────────────
  socket.on('tracking:watch', async ({ sessionId }) => {
    try {
      if (!sessionId) return;

      const db   = getDb();
      const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();

      if (!snap.exists) {
        socket.emit('tracking:error', { message: 'Session not found' });
        return;
      }

      const session = snap.data();

      // Verify the viewer is authorised
      const allowed =
        session.trackingUserId === socket.userId ||
        (session.trackedBy || []).includes(socket.userId) ||
        socket.userRole === 'admin';

      if (!allowed) {
        socket.emit('tracking:error', { message: 'Not authorised to watch this session' });
        return;
      }

      socket.join(`tracking:${sessionId}`);

      // Send the latest known location immediately if available
      if (session.currentLocation) {
        socket.emit('tracking:location', {
          sessionId,
          donorId:  session.trackingUserId,
          location: session.currentLocation,
        });
      }
    } catch (err) {
      logger.error('tracking:watch error:', err);
      socket.emit('tracking:error', { message: 'Failed to watch session' });
    }
  });

  // ── Leave watching ──────────────────────────────────────────────────────
  socket.on('tracking:unwatch', ({ sessionId }) => {
    if (sessionId) socket.leave(`tracking:${sessionId}`);
  });

  // ── Stop a tracking session ─────────────────────────────────────────────
  socket.on('tracking:stop', async ({ sessionId }) => {
    try {
      if (!sessionId) return;

      const db   = getDb();
      const snap = await db.collection(collections.LOCATIONS).doc(sessionId).get();

      if (!snap.exists) return;

      const session = snap.data();
      if (session.trackingUserId !== socket.userId && socket.userRole !== 'admin') {
        socket.emit('tracking:error', { message: 'Not authorised to stop this session' });
        return;
      }

      await db.collection(collections.LOCATIONS).doc(sessionId).update({
        isActive:  false,
        endedAt:   serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      io.to(`tracking:${sessionId}`).emit('tracking:stopped', { sessionId });

      for (const viewerId of (session.trackedBy || [])) {
        io.to(`user:${viewerId}`).emit('tracking:stopped', { sessionId });
      }

      logger.info(`Tracking stopped: session=${sessionId}`);
    } catch (err) {
      logger.error('tracking:stop error:', err);
    }
  });
};

module.exports = registerTrackingHandlers;