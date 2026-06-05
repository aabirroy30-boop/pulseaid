// src/routes/authRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { isAdmin }      = require('../middleware/roleCheck');
const { validate }     = require('../middleware/validate');
const { registerValidation } = require('../utils/validators');

// Public — Register only (Login is done on FRONTEND via Firebase SDK)
router.post('/register', registerValidation, validate, ctrl.register);

// Protected
router.use(authenticate);
router.post('/logout',          ctrl.logout);
router.get ('/profile',         ctrl.getProfile);
router.put ('/profile',         ctrl.updateProfile);
router.delete('/account',       ctrl.deleteAccount);

// Admin only
router.get ('/users',                    isAdmin, ctrl.getAllUsers);
router.patch('/users/:userId/block',     isAdmin, ctrl.toggleBlockUser);
router.patch('/users/:userId/verify',    isAdmin, ctrl.verifyUser);

module.exports = router;