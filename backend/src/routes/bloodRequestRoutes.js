// src/routes/bloodRequestRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/bloodRequestController');
const { authenticate } = require('../middleware/auth');
const { roleCheck, isAdmin } = require('../middleware/roleCheck');
const { validate }   = require('../middleware/validate');
const { bloodRequestValidation } = require('../utils/validators');
const { body }       = require('express-validator');

router.use(authenticate);

// Get all / nearby
router.get  ('/',         ctrl.getAllRequests);
router.get  ('/nearby',   ctrl.getNearbyRequests);
router.get  ('/:requestId', ctrl.getRequest);

// Create request — user, hospital, ngo, blood_bank, admin
router.post ('/',
  roleCheck('user', 'hospital', 'ngo', 'blood_bank', 'admin'),
  bloodRequestValidation,
  validate,
  ctrl.createRequest
);

// Donor responds
router.patch('/:requestId/respond',
  roleCheck('donor', 'admin'),
  body('action').isIn(['accept', 'reject']),
  validate,
  ctrl.respondToRequest
);

// Update status
router.patch('/:requestId/status',
  body('status').isIn(['pending', 'active', 'fulfilled', 'cancelled']),
  validate,
  ctrl.updateRequestStatus
);

// Fulfill request
router.patch('/:requestId/fulfill',
  roleCheck('hospital', 'ngo', 'blood_bank', 'admin'),
  ctrl.fulfillRequest
);

// Cancel request
router.delete('/:requestId', ctrl.cancelRequest);

module.exports = router;