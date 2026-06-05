// src/services/storageService.js
'use strict';

const fs             = require('fs');
const path           = require('path');
const { getStorage } = require('../config/firebase');
const { logger }     = require('../utils/logger');

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Upload a local file to Firebase Storage and return a signed download URL.
 *
 * @param {string} localPath        – absolute path to the local file
 * @param {string} storagePath      – destination path inside the bucket (e.g. 'profiles/uid.jpg')
 * @param {string} [contentType]    – MIME type (auto-detected by extension if omitted)
 * @param {number} [expiresMs]      – URL expiry in ms (default: 1 year)
 * @returns {Promise<string>}       – signed download URL
 */
const uploadFile = async (localPath, storagePath, contentType, expiresMs = ONE_YEAR_MS) => {
  const bucket = getStorage().bucket();

  const metadata = {};
  if (contentType) metadata.contentType = contentType;

  await bucket.upload(localPath, { destination: storagePath, metadata });

  const [url] = await bucket.file(storagePath).getSignedUrl({
    action:  'read',
    expires: Date.now() + expiresMs,
  });

  logger.info(`Uploaded ${localPath} → gs://${storagePath}`);
  return url;
};

/**
 * Upload a Buffer directly (no local file needed).
 *
 * @param {Buffer} buffer
 * @param {string} storagePath
 * @param {string} contentType
 * @returns {Promise<string>}
 */
const uploadBuffer = async (buffer, storagePath, contentType) => {
  const bucket = getStorage().bucket();
  const file   = bucket.file(storagePath);

  await file.save(buffer, { metadata: { contentType } });

  const [url] = await file.getSignedUrl({
    action:  'read',
    expires: Date.now() + ONE_YEAR_MS,
  });

  return url;
};

/**
 * Delete a file from Firebase Storage.
 *
 * @param {string} storagePath
 */
const deleteFile = async (storagePath) => {
  try {
    const bucket = getStorage().bucket();
    await bucket.file(storagePath).delete();
    logger.info(`Deleted gs://${storagePath}`);
  } catch (err) {
    logger.warn(`Could not delete gs://${storagePath}: ${err.message}`);
  }
};

/**
 * Upload a profile image and clean up the local temp file.
 *
 * @param {string} localPath
 * @param {string} uid         – user UID (used in storage path)
 * @param {string} folder      – 'profiles' | 'certificates' | 'documents'
 * @returns {Promise<string>}  – download URL
 */
const uploadProfileImage = async (localPath, uid, folder = 'profiles') => {
  const ext  = path.extname(localPath);
  const dest = `${folder}/${uid}${ext}`;

  try {
    const url = await uploadFile(localPath, dest, undefined);

    // Remove local temp file
    try { fs.unlinkSync(localPath); } catch (_) {}

    return url;
  } catch (err) {
    logger.error(`uploadProfileImage failed for uid=${uid}:`, err);
    throw err;
  }
};

module.exports = {
  uploadFile,
  uploadBuffer,
  deleteFile,
  uploadProfileImage,
};