// src/controllers/chatController.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp, arrayUnion } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const { emitToUser } = require('../config/socket');
const notificationService = require('../services/notificationService');

// ── Create or Get Chat Room ───────────────────────────────────────────────────
exports.getOrCreateChat = async (req, res) => {
  try {
    const { targetUserId, requestId } = req.body;
    const db      = getDb();
    const myUid   = req.user.uid;

    if (myUid === targetUserId) return errorResponse(res, 'Cannot chat with yourself.', 400);

    // Check existing chat between these two users (optionally for same requestId)
    let chatSnap;
    if (requestId) {
      chatSnap = await db.collection(collections.CHATS)
        .where('requestId', '==', requestId)
        .where('participants', 'array-contains', myUid)
        .limit(1)
        .get();
    } else {
      chatSnap = await db.collection(collections.CHATS)
        .where('participants', 'array-contains', myUid)
        .get();
      // filter to find chat with both participants
      const existing = chatSnap.docs.find((d) =>
        d.data().participants.includes(targetUserId) && !d.data().requestId
      );
      chatSnap = existing ? { docs: [existing], empty: false } : { docs: [], empty: true };
    }

    if (!chatSnap.empty) {
      return successResponse(res, { chat: chatSnap.docs[0].data() }, 'Chat fetched');
    }

    // Fetch target user info
    const targetSnap = await db.collection(collections.USERS).doc(targetUserId).get();
    if (!targetSnap.exists) return errorResponse(res, 'Target user not found.', 404);
    const targetUser = targetSnap.data();

    const chatId = uuidv4();
    const chatDoc = {
      chatId,
      participants:     [myUid, targetUserId],
      participantNames: {
        [myUid]:       req.user.name,
        [targetUserId]: targetUser.name,
      },
      participantRoles: {
        [myUid]:       req.user.role,
        [targetUserId]: targetUser.role,
      },
      requestId:     requestId || null,
      lastMessage:   null,
      lastMessageAt: null,
      unreadCounts:  { [myUid]: 0, [targetUserId]: 0 },
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    };

    await db.collection(collections.CHATS).doc(chatId).set(chatDoc);

    return successResponse(res, { chat: chatDoc }, 'Chat created', 201);
  } catch (error) {
    logger.error('Get or create chat error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get My Chats ──────────────────────────────────────────────────────────────
exports.getMyChats = async (req, res) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.CHATS)
      .where('participants', 'array-contains', req.user.uid)
      .orderBy('updatedAt', 'desc')
      .get();

    const chats = snap.docs.map((d) => d.data());
    return successResponse(res, { chats, total: chats.length }, 'Chats fetched');
  } catch (error) {
    logger.error('Get my chats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Send Message ──────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { chatId }   = req.params;
    const { content, messageType = 'text', fileUrl } = req.body;
    const db           = getDb();

    // Validate chat access
    const chatSnap = await db.collection(collections.CHATS).doc(chatId).get();
    if (!chatSnap.exists) return errorResponse(res, 'Chat not found.', 404);

    const chat = chatSnap.data();
    if (!chat.participants.includes(req.user.uid)) {
      return errorResponse(res, 'Not a participant in this chat.', 403);
    }

    const messageId = uuidv4();
    const message = {
      messageId,
      chatId,
      senderId:    req.user.uid,
      senderName:  req.user.name,
      content:     content || '',
      messageType,             // text | image | file | location
      fileUrl:     fileUrl || null,
      isRead:      false,
      createdAt:   serverTimestamp(),
    };

    // Write message
    await db.collection(collections.MESSAGES).doc(messageId).set(message);

    // Update chat
    const otherParticipant = chat.participants.find((p) => p !== req.user.uid);
    await db.collection(collections.CHATS).doc(chatId).update({
      lastMessage:   content || (messageType !== 'text' ? `[${messageType}]` : ''),
      lastMessageAt: serverTimestamp(),
      [`unreadCounts.${otherParticipant}`]: (chat.unreadCounts?.[otherParticipant] || 0) + 1,
      updatedAt: serverTimestamp(),
    });

    // Real-time delivery
    emitToUser(otherParticipant, 'new_message', message);

    // Push notification (silent if online)
    await notificationService.sendToUser(otherParticipant, {
      title: `💬 ${req.user.name}`,
      body:  content || `Sent a ${messageType}`,
      data:  { type: 'new_message', chatId, messageId },
    });

    return successResponse(res, { message }, 'Message sent', 201);
  } catch (error) {
    logger.error('Send message error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Messages ──────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { chatId }          = req.params;
    const { page = 1, limit = 50 } = req.query;
    const db                  = getDb();

    const chatSnap = await db.collection(collections.CHATS).doc(chatId).get();
    if (!chatSnap.exists) return errorResponse(res, 'Chat not found.', 404);

    if (!chatSnap.data().participants.includes(req.user.uid)) {
      return errorResponse(res, 'Not authorized.', 403);
    }

    const snap   = await db.collection(collections.MESSAGES)
      .where('chatId', '==', chatId)
      .orderBy('createdAt', 'desc')
      .get();

    const total   = snap.size;
    const offset  = (Number(page) - 1) * Number(limit);
    const messages = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data()).reverse();

    // Mark as read
    await db.collection(collections.CHATS).doc(chatId).update({
      [`unreadCounts.${req.user.uid}`]: 0,
    });

    return successResponse(res, {
      messages,
      pagination: { total, page: Number(page), limit: Number(limit) },
    }, 'Messages fetched');
  } catch (error) {
    logger.error('Get messages error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Mark Messages Read ────────────────────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const db         = getDb();

    await db.collection(collections.CHATS).doc(chatId).update({
      [`unreadCounts.${req.user.uid}`]: 0,
    });

    // Mark individual messages read in batch
    const snap = await db.collection(collections.MESSAGES)
      .where('chatId', '==', chatId)
      .where('isRead', '==', false)
      .get();

    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((d) => {
        if (d.data().senderId !== req.user.uid) {
          batch.update(d.ref, { isRead: true });
        }
      });
      await batch.commit();
    }

    return successResponse(res, {}, 'Messages marked as read');
  } catch (error) {
    logger.error('Mark read error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete Message ────────────────────────────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const db            = getDb();

    const snap = await db.collection(collections.MESSAGES).doc(messageId).get();
    if (!snap.exists) return errorResponse(res, 'Message not found.', 404);

    if (snap.data().senderId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    await db.collection(collections.MESSAGES).doc(messageId).update({
      content:   '[Message deleted]',
      isDeleted: true,
    });

    return successResponse(res, {}, 'Message deleted');
  } catch (error) {
    logger.error('Delete message error:', error);
    return errorResponse(res, error.message, 500);
  }
};