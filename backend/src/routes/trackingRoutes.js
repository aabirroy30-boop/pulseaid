// src/routes/trackingRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/trackingController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');
const { body }         = require('express-validator');

router.use(authenticate);

// Tracking sessions
router.post ('/',              ctrl.startTracking);
router.get  ('/:sessionId',   ctrl.getSession);
router.patch('/:sessionId/location',
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  validate,
  ctrl.updateLocation
);
router.patch('/:sessionId/stop', ctrl.stopTracking);

// Maps utilities
router.get('/maps/directions',      ctrl.getDirections);
router.get('/maps/eta',             ctrl.getETA);
router.get('/maps/geocode',         ctrl.geocode);
router.get('/maps/reverse-geocode', ctrl.reverseGeocode);

module.exports = router;