// src/middleware/validate.js
'use strict';

const { validationResult } = require('express-validator');
const { errorResponse }    = require('../utils/apiResponse');

/**
 * Run after express-validator chains.
 * Collects errors and returns 422 if any exist.
 */
const validate = (req, res, next) => {
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

module.exports = { validate };