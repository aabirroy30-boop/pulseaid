// src/app.js
'use strict';

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const compression    = require('compression');
const rateLimit      = require('express-rate-limit');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { logger }       = require('./utils/logger');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const donorRoutes         = require('./routes/donorRoutes');
const bloodRequestRoutes  = require('./routes/bloodRequestRoutes');
const inventoryRoutes     = require('./routes/inventoryRoutes');
const paymentRoutes       = require('./routes/paymentRoutes');
const certificateRoutes   = require('./routes/certificateRoutes');
const chatRoutes          = require('./routes/chatRoutes');
const notificationRoutes  = require('./routes/notificationRoutes');
const trackingRoutes      = require('./routes/trackingRoutes');
const analyticsRoutes     = require('./routes/analyticsRoutes');
const adminRoutes         = require('./routes/adminRoutes');
const organizationRoutes  = require('./routes/organizationRoutes');

const app = express();

// ── Security & utility middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin:      process.env.CLIENT_URL || '*',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP request logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PulseAid API', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authLimiter, authRoutes);
app.use(`${API}/donors`,        donorRoutes);
app.use(`${API}/blood-requests`,bloodRequestRoutes);
app.use(`${API}/inventory`,     inventoryRoutes);
app.use(`${API}/payments`,      paymentRoutes);
app.use(`${API}/certificates`,  certificateRoutes);
app.use(`${API}/chat`,          chatRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/tracking`,      trackingRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/organizations`, organizationRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(globalErrorHandler);

module.exports = app;