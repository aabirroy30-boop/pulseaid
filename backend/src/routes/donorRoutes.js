// src/routes/donorRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/donorController');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isDonor, roleCheck } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { body }     = require('express-validator');

router.use(authenticate);

// Public (authenticated) — find nearest donors
router.get('/nearest',         ctrl.findNearestDonors);
router.get('/',                ctrl.getAllDonors);
router.get('/me',              isDonor, ctrl.getMyDonorProfile);
router.get('/saved',           ctrl.getSavedDonors);
router.get('/:donorId',        ctrl.getDonor);
router.get('/:donorId/history', ctrl.getDonationHistory);

// Donor only — update own profile
router.patch('/availability',
  isDonor,
  body('isAvailable').isBoolean(),
  validate,
  ctrl.updateAvailability
);

router.patch('/location',
  isDonor,
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  validate,
  ctrl.updateLocation
);

// Rate a donor (user or hospital)
router.post('/:donorId/rate',
  roleCheck('user', 'hospital', 'ngo', 'blood_bank', 'admin'),
  body('rating').isInt({ min: 1, max: 5 }),
  validate,
  ctrl.rateDonor
);

// Save / unsave donor
router.post('/:donorId/save',  ctrl.toggleSaveDonor);

// Admin only
router.patch('/:donorId/verify',
  isAdmin,
  body('action').isIn(['verify', 'reject']),
  validate,
  ctrl.verifyDonor
);

module.exports = router;