// src/config/firebase.js
const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

let db, auth, storage, messaging;

const initializeFirebase = () => {
  try {
    if (admin.apps.length > 0) {
      logger.info('Firebase already initialized, reusing existing app.');
      const app = admin.app();
      db        = admin.firestore(app);
      auth      = admin.auth(app);
      storage   = admin.storage(app);
      messaging = admin.messaging(app);
      return { db, auth, storage, messaging };
    }

    const serviceAccount = {
      type: 'service_account',
      project_id:   process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential:    admin.credential.cert(serviceAccount),
      databaseURL:   process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    db        = admin.firestore();
    auth      = admin.auth();
    storage   = admin.storage();
    messaging = admin.messaging();

    // Firestore settings
    db.settings({ ignoreUndefinedProperties: true });

    logger.info('✅  Firebase initialized successfully');
    return { db, auth, storage, messaging };
  } catch (error) {
    logger.error('❌  Firebase initialization failed:', error);
    throw error;
  }
};

// ── Firestore Collection References ───────────────────────────────────────────
const collections = {
  USERS:         'users',
  DONORS:        'donors',
  REQUESTS:      'blood_requests',
  INVENTORY:     'inventory',
  PAYMENTS:      'payments',
  CERTIFICATES:  'certificates',
  CHATS:         'chats',
  MESSAGES:      'messages',
  NOTIFICATIONS: 'notifications',
  ORGANIZATIONS: 'organizations',
  LOCATIONS:     'locations',
  ANALYTICS:     'analytics',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const getDb        = () => db;
const getAuth      = () => auth;
const getStorage   = () => storage;
const getMessaging = () => messaging;

const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();
const increment       = (n = 1) => admin.firestore.FieldValue.increment(n);
const arrayUnion      = (...items) => admin.firestore.FieldValue.arrayUnion(...items);
const arrayRemove     = (...items) => admin.firestore.FieldValue.arrayRemove(...items);

const GeoPoint = (lat, lng) => new admin.firestore.GeoPoint(lat, lng);

module.exports = {
  initializeFirebase,
  getDb,
  getAuth,
  getStorage,
  getMessaging,
  collections,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  GeoPoint,
  admin,
};