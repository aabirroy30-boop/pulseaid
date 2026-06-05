// src/routes/paymentRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { isAdmin }      = require('../middleware/roleCheck');
const { validate }     = require('../middleware/validate');
const { paymentValidation } = require('../utils/validators');
const express          = require('express');

// Webhook — raw body, no auth
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  ctrl.webhook
);

router.use(authenticate);

router.get  ('/',             ctrl.getMyPayments);
router.get  ('/:paymentId',   ctrl.getPayment);
router.post ('/order',        paymentValidation, validate, ctrl.createOrder);
router.post ('/verify',       ctrl.verifyPayment);

// Admin
router.get  ('/admin/all',    isAdmin, ctrl.getAllPayments);
router.post ('/:paymentId/refund', isAdmin, ctrl.refundPayment);

module.exports = router;