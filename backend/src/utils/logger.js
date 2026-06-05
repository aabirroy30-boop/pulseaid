// src/utils/logger.js
const winston = require('winston');
const path    = require('path');

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level:      process.env.LOG_LEVEL || 'info',
  format:     combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'pulseaid-api' },
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level:    'error',
      maxsize:  10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize:  10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    })
  );
}

module.exports = { logger };