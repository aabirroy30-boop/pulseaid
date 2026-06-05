// src/server.js
'use strict';

require('dotenv').config();
require('express-async-errors');

const http             = require('http');
const app              = require('./app');
const { initializeFirebase } = require('./config/firebase');
const { initializeSocket }   = require('./config/socket');
const { logger }             = require('./utils/logger');
const { registerSocketHandlers } = require('./sockets');

const PORT = process.env.PORT || 5000;

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // 1. Firebase
    initializeFirebase();

    // 2. HTTP server
    const httpServer = http.createServer(app);

    // 3. Socket.io
    const io = initializeSocket(httpServer);
    registerSocketHandlers(io);

    // 4. Listen
    httpServer.listen(PORT, () => {
      logger.info(`🚀  PulseAid API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // 5. Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully…`);
      httpServer.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();