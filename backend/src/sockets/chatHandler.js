// src/sockets/chatHandler.js
'use strict';

const { v4: uuidv4 }  = require('uuid');
const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { emitToUser }  = require('../config/socket');
const { logger }      = require('../utils/logger');

/**
 * Register chat-related Socket.io events on a connected socket.
 *
 * Supported events (client → server):
 *   chat:join        { chatId }
 *   chat:leave       { chatId }
 *   chat:typing      { chatId }
 *   chat:stop_typing { chatId }
 *   chat:message     { chatId, content, messageType? }
 *   chat:read        { chatId }
 *
 * Emitted events (server → client):
 *   chat:joined      { chatId }
 *   chat:typing      { chatId, userId, name }
 *   chat:stop_typing { chatId, userId }
 *   chat:message     { message }
 *   chat:read        { chatId, userId }
 *   chat:error       { message }
 */
const registerChatHandlers = (io, socket) => {
  // ── Join chat room ──────────────────────────────────────────────────────
  socket.on('chat:join', async ({ chatId }) => {
    try {
      if (!chatId) return;

      const db   = getDb();
      const snap = await db.collection(collections.CHATS).doc(chatId).get();
      if (!snap.exists) {
        socket.emit('chat:error', { message: 'Chat not found' });
        return;
      }

      const chat = snap.data();
      if (!chat.participants.includes(socket.userId)) {
        socket.emit('chat:error', { message: 'Not a participant in this chat' });
        return;
      }

      socket.join(`chat:${chatId}`);
      socket.emit('chat:joined', { chatId });
      logger.info(`User ${socket.userId} joined chat room: ${chatId}`);
    } catch (err) {
      logger.error('chat:join error:', err);
      socket.emit('chat:error', { message: 'Failed to join chat' });
    }
  });

  // ── Leave chat room ─────────────────────────────────────────────────────
  socket.on('chat:leave', ({ chatId }) => {
    if (!chatId) return;
    socket.leave(`chat:${chatId}`);
    logger.info(`User ${socket.userId} left chat room: ${chatId}`);
  });

  // ── Typing indicators ───────────────────────────────────────────────────
  socket.on('chat:typing', ({ chatId }) => {
    socket.to(`chat:${chatId}`).emit('chat:typing', {
      chatId,
      userId: socket.userId,
      name:   socket.user?.name || 'Someone',
    });
  });

  socket.on('chat:stop_typing', ({ chatId }) => {
    socket.to(`chat:${chatId}`).emit('chat:stop_typing', {
      chatId,
      userId: socket.userId,
    });
  });

  // ── Send message via socket (real-time path) ────────────────────────────
  socket.on('chat:message', async ({ chatId, content, messageType = 'text', fileUrl }) => {
    try {
      if (!chatId || (!content && messageType === 'text')) {
        socket.emit('chat:error', { message: 'chatId and content are required' });
        return;
      }

      const db       = getDb();
      const chatSnap = await db.collection(collections.CHATS).doc(chatId).get();

      if (!chatSnap.exists) {
        socket.emit('chat:error', { message: 'Chat not found' });
        return;
      }

      const chat = chatSnap.data();
      if (!chat.participants.includes(socket.userId)) {
        socket.emit('chat:error', { message: 'Not a participant' });
        return;
      }

      const messageId = uuidv4();
      const message   = {
        messageId,
        chatId,
        senderId:    socket.userId,
        senderName:  socket.user?.name || '',
        content:     content || '',
        messageType,
        fileUrl:     fileUrl || null,
        isRead:      false,
        createdAt:   serverTimestamp(),
      };

      await db.collection(collections.MESSAGES).doc(messageId).set(message);

      const other = chat.participants.find((p) => p !== socket.userId);

      await db.collection(collections.CHATS).doc(chatId).update({
        lastMessage:   content || `[${messageType}]`,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${other}`]: (chat.unreadCounts?.[other] || 0) + 1,
        updatedAt:     serverTimestamp(),
      });

      // Broadcast to everyone in the chat room (includes sender)
      io.to(`chat:${chatId}`).emit('chat:message', { ...message, createdAt: new Date().toISOString() });

      // Also push to the other user's personal room in case they're not in the chat room
      emitToUser(other, 'new_message', { ...message, createdAt: new Date().toISOString() });
    } catch (err) {
      logger.error('chat:message error:', err);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // ── Mark read ───────────────────────────────────────────────────────────
  socket.on('chat:read', async ({ chatId }) => {
    try {
      const db = getDb();
      await db.collection(collections.CHATS).doc(chatId).update({
        [`unreadCounts.${socket.userId}`]: 0,
      });
      socket.to(`chat:${chatId}`).emit('chat:read', { chatId, userId: socket.userId });
    } catch (err) {
      logger.error('chat:read error:', err);
    }
  });
};

module.exports = registerChatHandlers;