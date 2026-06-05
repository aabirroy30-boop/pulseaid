// src/routes/organizationRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/organizationController');
const { authenticate } = require('../middleware/auth');
const { isOrg }        = require('../middleware/roleCheck');

router.use(authenticate);

router.get  ('/',             ctrl.getAllOrganizations);
router.get  ('/nearby',       ctrl.findNearbyOrganizations);
router.get  ('/:orgId',       ctrl.getOrganization);
router.get  ('/:orgId/requests', ctrl.getRequestHistory);
router.put  ('/me',           isOrg, ctrl.updateProfile);

module.exports = router;