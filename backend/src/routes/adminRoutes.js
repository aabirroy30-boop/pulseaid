// src/routes/adminRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { isAdmin }      = require('../middleware/roleCheck');
const { validate }     = require('../middleware/validate');
const { body }         = require('express-validator');

router.use(authenticate, isAdmin);

router.get  ('/donors/pending',        ctrl.getPendingDonors);
router.get  ('/organizations/pending', ctrl.getPendingOrganizations);
router.patch('/verify/:entityId',
  body('action').isIn(['verify', 'reject']),
  validate,
  ctrl.verifyEntity
);

router.get  ('/requests',             ctrl.getAllRequests);
router.get  ('/activity',             ctrl.getRecentActivity);

router.get  ('/settings',             ctrl.getSettings);
router.put  ('/settings',             ctrl.updateSettings);

router.delete('/users/:userId',       ctrl.deleteUser);

module.exports = router;