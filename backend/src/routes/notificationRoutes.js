// src/routes/notificationRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { isAdmin }      = require('../middleware/roleCheck');
const { validate }     = require('../middleware/validate');
const { body }         = require('express-validator');

router.use(authenticate);

router.get  ('/',                         ctrl.getMyNotifications);
router.patch('/read-all',                 ctrl.markAllRead);
router.post ('/fcm-token',
  body('fcmToken').notEmpty(),
  validate,
  ctrl.registerFcmToken
);
router.patch('/:notificationId/read',     ctrl.markRead);
router.delete('/:notificationId',         ctrl.deleteNotification);

// Admin
router.post('/broadcast',  isAdmin,
  body('title').notEmpty(),
  body('body').notEmpty(),
  validate,
  ctrl.broadcastNotification
);
router.post('/send',  isAdmin,
  body('userId').notEmpty(),
  body('title').notEmpty(),
  body('body').notEmpty(),
  validate,
  ctrl.sendCustomNotification
);

module.exports = router;