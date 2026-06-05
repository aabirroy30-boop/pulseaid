// src/middleware/errorHandler.js
const { validationResult } = require('express-validator');
const { errorResponse }    = require('../utils/apiResponse');
const { logger }           = require('../utils/logger');

/**
 * Process express-validator results.
 * Place this AFTER your validation chains.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field:   e.path || e.param,
      message: e.msg,
      value:   e.value,
    }));
    return errorResponse(res, 'Validation failed', 422, formatted);
  }
  next();
};

/**
 * 404 – route not found.
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global error handler – must be registered last.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack:   err.stack,
    url:     req.originalUrl,
    method:  req.method,
    user:    req.user?.uid || 'unauthenticated',
  });

  // Firebase / Firestore errors
  if (err.code?.startsWith('firestore/') || err.code?.startsWith('auth/')) {
    return errorResponse(res, 'Database operation failed', 503);
  }

  // Razorpay errors
  if (err.statusCode && err.error) {
    return errorResponse(res, err.error.description || 'Payment gateway error', 502);
  }

  const status  = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return errorResponse(res, message, status);
};

module.exports = {
  handleValidationErrors,
  notFoundHandler,
  globalErrorHandler,
};