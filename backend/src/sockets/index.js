// src/sockets/index.js
'use strict';

const { logger } = require('../utils/logger');

const registerChatHandlers     = require('./chatHandler');
const registerTrackingHandlers = require('./trackingHandler');
const registerNotifHandlers    = require('./notificationHandler');

/**
 * Register all Socket.io namespace/event handlers.
 * Called once after `initializeSocket` in server.js.
 *
 * @param {import('socket.io').Server} io
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.userRole}`);

    // ── Register domain handlers ─────────────────────────────────────────
    registerChatHandlers(io, socket);
    registerTrackingHandlers(io, socket);
    registerNotifHandlers(io, socket);

    // ── Ping / Pong health check ─────────────────────────────────────────
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // ── Join a room explicitly (e.g. to watch a tracking session) ────────
    socket.on('join_room', ({ room }) => {
      if (room && typeof room === 'string') {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      }
    });

    socket.on('leave_room', ({ room }) => {
      if (room && typeof room === 'string') {
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room: ${room}`);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
    });
  });

  logger.info('✅  Socket.io handlers registered');
};

module.exports = { registerSocketHandlers };