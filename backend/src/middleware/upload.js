// src/middleware/upload.js
'use strict';

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { errorResponse } = require('../utils/apiResponse');

// ── Temp upload directory ─────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), 'temp', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Disk storage ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// ── File filters ──────────────────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
  }
};

const documentFilter = (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

// ── Multer instances ──────────────────────────────────────────────────────────

/** Single profile image upload (field name: 'image') */
const uploadProfileImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('image');

/** Single document upload (field name: 'document') */
const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('document');

/** Multiple images (field name: 'images', max 5) */
const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 5);

// ── Express middleware wrappers (handle multer errors) ─────────────────────────

const handleUpload = (multerFn) => (req, res, next) => {
  multerFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, 'File size exceeds limit.', 413);
      }
      return errorResponse(res, `Upload error: ${err.message}`, 400);
    }
    if (err) {
      return errorResponse(res, err.message, 400);
    }
    next();
  });
};

module.exports = {
  uploadProfileImage: handleUpload(uploadProfileImage),
  uploadDocument:     handleUpload(uploadDocument),
  uploadMultipleImages: handleUpload(uploadMultipleImages),
  UPLOAD_DIR,
};