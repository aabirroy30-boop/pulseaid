// src/config/socket.js
'use strict';

const { Server } = require('socket.io');
const { getAuth } = require('./firebase');
const { logger }  = require('../utils/logger');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL || '*',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ── Firebase Auth Middleware ───────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) return next(new Error('Authentication token missing'));

    try {
      const decoded     = await getAuth().verifyIdToken(token);
      socket.user       = decoded;
      socket.userId     = decoded.uid;
      socket.userRole   = decoded.role || null;
      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err.message}`);
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id} | User: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);
    if (socket.userRole) socket.join(`role:${socket.userRole}`);

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized.');
  return io;
};

const emitToUser = (userId, event, data) => getIo().to(`user:${userId}`).emit(event, data);
const emitToRole = (role, event, data)   => getIo().to(`role:${role}`).emit(event, data);
const emitToRoom = (room, event, data)   => getIo().to(room).emit(event, data);
const broadcast  = (event, data)         => getIo().emit(event, data);

module.exports = { initializeSocket, getIo, emitToUser, emitToRole, emitToRoom, broadcast };