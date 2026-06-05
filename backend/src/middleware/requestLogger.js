// src/middleware/requestLogger.js
'use strict';

const { logger } = require('../utils/logger');

/**
 * Request/response audit logger.
 * Logs method, URL, status, response time, and user.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData  = {
      method:   req.method,
      url:      req.originalUrl,
      status:   res.statusCode,
      duration: `${duration}ms`,
      ip:       req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId:   req.user?.uid || 'anonymous',
      role:     req.user?.role || '-',
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request client error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

module.exports = { requestLogger };