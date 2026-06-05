// src/services/notificationService.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { getDb, getMessaging, collections, serverTimestamp } = require('../config/firebase');
const { emitToUser } = require('../config/socket');
const { logger }     = require('../utils/logger');

// ── Email transporter ─────────────────────────────────────────────────────────
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// ── Save notification to Firestore ────────────────────────────────────────────
const saveNotification = async (userId, { title, body, data = {} }) => {
  try {
    const notificationId = uuidv4();
    await getDb().collection(collections.NOTIFICATIONS).doc(notificationId).set({
      notificationId,
      userId,
      title,
      body,
      data,
      isRead:    false,
      createdAt: serverTimestamp(),
    });
    return notificationId;
  } catch (err) {
    logger.error('Save notification error:', err);
  }
};

// ── Send FCM Push Notification ────────────────────────────────────────────────
const sendFCM = async (tokens, { title, body, data = {} }) => {
  if (!tokens || tokens.length === 0) return;

  try {
    const messaging = getMessaging();
    const message   = {
      notification: { title, body },
      data:         Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    logger.info(`FCM sent: ${response.successCount}/${tokens.length} delivered`);
    return response;
  } catch (err) {
    logger.error('FCM send error:', err);
  }
};

// ── Send to a specific user ───────────────────────────────────────────────────
const sendToUser = async (userId, { title, body, data = {} }) => {
  try {
    const db      = getDb();
    const snap    = await db.collection(collections.USERS).doc(userId).get();
    if (!snap.exists) return;

    const user    = snap.data();
    const tokens  = user.fcmTokens || [];

    // 1. FCM push
    await sendFCM(tokens, { title, body, data });

    // 2. Socket real-time
    emitToUser(userId, 'notification', { title, body, data });

    // 3. Persist
    await saveNotification(userId, { title, body, data });
  } catch (err) {
    logger.error(`Send to user ${userId} error:`, err);
  }
};

// ── Send to multiple users ────────────────────────────────────────────────────
const sendToUsers = async (userIds, notification) => {
  await Promise.all(userIds.map((id) => sendToUser(id, notification)));
};

// ── Send to role ──────────────────────────────────────────────────────────────
const sendToRole = async (role, notification) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.USERS).where('role', '==', role).get();
    const ids  = snap.docs.map((d) => d.id);
    await sendToUsers(ids, notification);
  } catch (err) {
    logger.error(`Send to role ${role} error:`, err);
  }
};

// ── Password reset email ──────────────────────────────────────────────────────
const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl  = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const mail      = getTransporter();

    await mail.sendMail({
      from:    `"PulseAid" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to:      email,
      subject: 'Reset Your PulseAid Password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <div style="background:#E53935;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;">PulseAid</h1>
            <p style="color:#fff;margin:4px 0;">Every Drop Counts</p>
          </div>
          <div style="padding:24px;">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your PulseAid password.</p>
            <p>Click the button below within <strong>15 minutes</strong>:</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}"
                 style="background:#E53935;color:#fff;padding:12px 32px;
                        text-decoration:none;border-radius:6px;font-size:16px;">
                Reset Password
              </a>
            </div>
            <p style="color:#666;font-size:13px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#999;">
            © ${new Date().getFullYear()} PulseAid. All rights reserved.
          </div>
        </div>
      `,
    });

    logger.info(`Password reset email sent to ${email}`);
  } catch (err) {
    logger.error('Send password reset email error:', err);
    throw err;
  }
};

// ── Welcome email ─────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, name, role) => {
  try {
    const mail = getTransporter();
    await mail.sendMail({
      from:    `"PulseAid" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to:      email,
      subject: `Welcome to PulseAid, ${name}! 🩸`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
          <div style="background:#E53935;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;">Welcome to PulseAid!</h1>
          </div>
          <div style="padding:24px;">
            <h2>Hello ${name},</h2>
            <p>Thank you for joining PulseAid as a <strong>${role}</strong>.</p>
            <p>Together we can save lives. <strong>Every drop counts.</strong></p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    logger.warn('Send welcome email error:', err);
  }
};

module.exports = {
  sendToUser,
  sendToUsers,
  sendToRole,
  sendFCM,
  saveNotification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};