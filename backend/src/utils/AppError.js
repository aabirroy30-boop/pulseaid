// src/utils/AppError.js
'use strict';

/**
 * Application-level error with HTTP status code.
 *
 * Usage:
 *   throw new AppError('Resource not found', 404);
 *   throw new AppError('Not authorised', 403);
 *
 * The global error handler in errorHandler.js checks `err.isOperational`
 * to decide whether to expose the message to the client.
 */
class AppError extends Error {
  /**
   * @param {string} message    – human-readable error description
   * @param {number} statusCode – HTTP status (default 500)
   * @param {Array}  [errors]   – optional array of validation / field errors
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);

    this.statusCode    = statusCode;
    this.status        = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;  // distinguishes from programming errors
    this.errors        = errors;

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// ── Common factory helpers ────────────────────────────────────────────────────

AppError.notFound      = (msg = 'Resource not found')   => new AppError(msg, 404);
AppError.unauthorized  = (msg = 'Unauthorized')          => new AppError(msg, 401);
AppError.forbidden     = (msg = 'Forbidden')             => new AppError(msg, 403);
AppError.badRequest    = (msg = 'Bad request')           => new AppError(msg, 400);
AppError.conflict      = (msg = 'Conflict')              => new AppError(msg, 409);
AppError.tooManyReqs   = (msg = 'Too many requests')     => new AppError(msg, 429);
AppError.serverError   = (msg = 'Internal server error') => new AppError(msg, 500);

module.exports = AppError;