// src/routes/certificateRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/certificateController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, isOrg, roleCheck }  = require('../middleware/roleCheck');
const { validate }  = require('../middleware/validate');
const { body }      = require('express-validator');

// Public: verify cert
router.get('/verify/:certificateId', ctrl.verifyCertificate);

// Protected
router.use(authenticate);

router.get  ('/',                   ctrl.getMyCertificates);
router.get  ('/:certificateId',     ctrl.getCertificate);
router.get  ('/download/:certificateId', ctrl.downloadCertificate);
router.get  ('/donor/:donorId',     ctrl.getMyCertificates);

// Issue certificate — org or admin
router.post ('/',
  roleCheck('hospital', 'ngo', 'blood_bank', 'admin'),
  [
    body('donorId').notEmpty(),
    body('donorName').notEmpty(),
    body('bloodGroup').notEmpty(),
    body('units').isInt({ min: 1 }),
    body('hospitalName').notEmpty(),
    body('donationDate').isISO8601(),
    body('type').optional().isIn(['appreciation', 'hero', 'lifesaver']),
  ],
  validate,
  ctrl.issueCertificate
);

module.exports = router;