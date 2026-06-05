// src/controllers/paymentController.js
'use strict';

const Razorpay        = require('razorpay');
const crypto          = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');

const getRazorpay = () =>
  new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

// ── Create Order ──────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', requestId, notes } = req.body;
    const razorpay = getRazorpay();

    const options = {
      amount:   Math.round(amount * 100),   // paise
      currency,
      receipt:  `receipt_${uuidv4().slice(0, 8)}`,
      notes: {
        requestId: requestId || '',
        userId:    req.user.uid,
        userName:  req.user.name,
        ...notes,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store pending payment record
    const paymentId = uuidv4();
    await getDb().collection(collections.PAYMENTS).doc(paymentId).set({
      paymentId,
      razorpayOrderId: order.id,
      userId:    req.user.uid,
      userName:  req.user.name,
      amount,
      currency,
      requestId: requestId || null,
      status:    'created',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return successResponse(res, {
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      paymentId,
      keyId:      process.env.RAZORPAY_KEY_ID,
    }, 'Order created', 201);
  } catch (error) {
    logger.error('Create order error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Verify Payment ────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    // Signature verification
    const body    = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      await getDb().collection(collections.PAYMENTS).doc(paymentId).update({
        status:    'failed',
        updatedAt: serverTimestamp(),
      });
      return errorResponse(res, 'Payment verification failed.', 400);
    }

    const db   = getDb();
    const snap = await db.collection(collections.PAYMENTS).doc(paymentId).get();

    if (!snap.exists) return errorResponse(res, 'Payment record not found.', 404);

    const payment = snap.data();

    await db.collection(collections.PAYMENTS).doc(paymentId).update({
      status:             'success',
      razorpayPaymentId:  razorpay_payment_id,
      razorpaySignature:  razorpay_signature,
      paidAt:             serverTimestamp(),
      updatedAt:          serverTimestamp(),
    });

    // Notify user
    await notificationService.sendToUser(payment.userId, {
      title: '✅ Payment Successful',
      body:  `Your payment of ₹${payment.amount} was successful.`,
      data:  { type: 'payment_success', paymentId, razorpayPaymentId: razorpay_payment_id },
    });

    return successResponse(res, {
      paymentId,
      razorpayPaymentId: razorpay_payment_id,
      status: 'success',
    }, 'Payment verified successfully');
  } catch (error) {
    logger.error('Verify payment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Webhook Handler (Razorpay → server) ──────────────────────────────────────
exports.webhook = async (req, res) => {
  try {
    const secret    = process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body      = JSON.stringify(req.body);

    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expected !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    const db = getDb();

    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      const snap    = await db.collection(collections.PAYMENTS)
        .where('razorpayOrderId', '==', orderId)
        .limit(1)
        .get();

      if (!snap.empty) {
        await db.collection(collections.PAYMENTS).doc(snap.docs[0].id).update({
          status:    'captured',
          updatedAt: serverTimestamp(),
        });
      }
    }

    if (event === 'payment.failed') {
      const orderId = payload.payment.entity.order_id;
      const snap    = await db.collection(collections.PAYMENTS)
        .where('razorpayOrderId', '==', orderId)
        .limit(1)
        .get();

      if (!snap.empty) {
        await db.collection(collections.PAYMENTS).doc(snap.docs[0].id).update({
          status:       'failed',
          failureReason: payload.payment.entity.error_description,
          updatedAt:    serverTimestamp(),
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// ── Get My Payments ───────────────────────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20 } = req.query;

    const snap = await db.collection(collections.PAYMENTS)
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const payments = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data());

    return successResponse(res, {
      payments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'Payments fetched');
  } catch (error) {
    logger.error('Get my payments error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Payment by ID ─────────────────────────────────────────────────────────
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const db            = getDb();

    const snap = await db.collection(collections.PAYMENTS).doc(paymentId).get();
    if (!snap.exists) return errorResponse(res, 'Payment not found.', 404);

    const payment = snap.data();
    if (payment.userId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    return successResponse(res, { payment }, 'Payment fetched');
  } catch (error) {
    logger.error('Get payment error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Admin: All Payments ───────────────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.PAYMENTS).orderBy('createdAt', 'desc');
    if (status) query = query.where('status', '==', status);

    const snap   = await query.get();
    const total  = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const payments = snap.docs.slice(offset, offset + Number(limit)).map((d) => d.data());

    return successResponse(res, {
      payments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    }, 'All payments fetched');
  } catch (error) {
    logger.error('Get all payments error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Initiate Refund ───────────────────────────────────────────────────────────
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const db   = getDb();
    const snap = await db.collection(collections.PAYMENTS).doc(paymentId).get();

    if (!snap.exists) return errorResponse(res, 'Payment not found.', 404);

    const payment  = snap.data();
    if (payment.status !== 'success' && payment.status !== 'captured') {
      return errorResponse(res, 'Only successful payments can be refunded.', 400);
    }

    const razorpay = getRazorpay();
    const refund   = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: amount ? Math.round(amount * 100) : undefined,
      notes:  { reason: reason || 'Refund requested' },
    });

    await db.collection(collections.PAYMENTS).doc(paymentId).update({
      status:          'refunded',
      refundId:        refund.id,
      refundAmount:    refund.amount / 100,
      refundedAt:      serverTimestamp(),
      updatedAt:       serverTimestamp(),
    });

    return successResponse(res, { refundId: refund.id }, 'Refund initiated successfully');
  } catch (error) {
    logger.error('Refund payment error:', error);
    return errorResponse(res, error.message, 500);
  }
};