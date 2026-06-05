// src/routes/analyticsRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isOrg, isDonor } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/admin',          isAdmin, ctrl.getAdminStats);
router.get('/donor',          isDonor, ctrl.getDonorStats);
router.get('/donor/:donorId', isAdmin, ctrl.getDonorStats);
router.get('/organization',   isOrg,   ctrl.getOrgStats);
router.get('/organization/:orgId', isAdmin, ctrl.getOrgStats);
router.get('/trends',         isAdmin, ctrl.getRequestTrends);
router.get('/leaderboard',             ctrl.getLeaderboard);

module.exports = router;