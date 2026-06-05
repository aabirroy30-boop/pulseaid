// src/utils/validators.js
const { body, param, query } = require('express-validator');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const ROLES        = ['user', 'donor', 'hospital', 'ngo', 'blood_bank', 'admin'];

// ── Auth ──────────────────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian mobile number required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('role').isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
  body('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Blood Request ─────────────────────────────────────────────────────────────
const bloodRequestValidation = [
  body('bloodGroup').isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
  body('units').isInt({ min: 1, max: 20 }).withMessage('Units must be between 1 and 20'),
  body('hospitalName').trim().notEmpty().withMessage('Hospital name is required'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('neededByDate').isISO8601().withMessage('Valid date required'),
  body('requestType')
    .isIn(['emergency', 'normal'])
    .withMessage('Request type must be emergency or normal'),
];

// ── Inventory ─────────────────────────────────────────────────────────────────
const inventoryValidation = [
  body('bloodGroup').isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
  body('units').isInt({ min: 0 }).withMessage('Units must be a non-negative integer'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date required'),
];

// ── Payment ───────────────────────────────────────────────────────────────────
const paymentValidation = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['INR', 'USD']).withMessage('Unsupported currency'),
  body('requestId').notEmpty().withMessage('Request ID is required'),
];

// ── Pagination ────────────────────────────────────────────────────────────────
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

// ── Mongo/Firestore ID ────────────────────────────────────────────────────────
const idParamValidation = (paramName = 'id') => [
  param(paramName).notEmpty().withMessage(`${paramName} is required`),
];

module.exports = {
  BLOOD_GROUPS,
  ROLES,
  registerValidation,
  loginValidation,
  bloodRequestValidation,
  inventoryValidation,
  paymentValidation,
  paginationValidation,
  idParamValidation,
};