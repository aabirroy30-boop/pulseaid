// src/routes/chatRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');
const { body }         = require('express-validator');

router.use(authenticate);

router.get  ('/',                     ctrl.getMyChats);
router.post ('/',
  body('targetUserId').notEmpty(),
  validate,
  ctrl.getOrCreateChat
);

router.get  ('/:chatId/messages',     ctrl.getMessages);
router.post ('/:chatId/messages',
  body('content').optional(),
  ctrl.sendMessage
);
router.patch('/:chatId/read',         ctrl.markRead);
router.delete('/messages/:messageId', ctrl.deleteMessage);

module.exports = router;