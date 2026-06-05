// src/utils/helpers.js
'use strict';

/**
 * Haversine formula – great-circle distance between two GPS coordinates.
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}  Distance in kilometres
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (lat2 == null || lon2 == null) return Infinity;
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Strip sensitive fields from a user/donor document before returning to client.
 *
 * @param {object} data   – raw Firestore document data
 * @returns {object}
 */
const sanitizeUser = (data) => {
  const {
    passwordHash,
    refreshTokenHash,
    fcmTokens,
    passwordResetToken,
    passwordResetExpiry,
    ...safe
  } = data || {};
  return safe;
};

/**
 * Simple in-memory pagination helper.
 *
 * @param {Array}  items
 * @param {number} page    – 1-based
 * @param {number} limit
 * @returns {{ data: Array, total: number, page: number, limit: number, pages: number }}
 */
const paginate = (items, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return {
    data:  items.slice(offset, offset + limit),
    total: items.length,
    page:  Number(page),
    limit: Number(limit),
    pages: Math.ceil(items.length / limit),
  };
};

/**
 * Generate a random alphanumeric code (for OTP, batch numbers, etc.).
 *
 * @param {number} [length=6]
 * @returns {string}
 */
const randomCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * Convert a Firestore Timestamp or ISO string to a plain Date.
 *
 * @param {object|string|null} ts
 * @returns {Date|null}
 */
const toDate = (ts) => {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  return new Date(ts);
};

/**
 * Deep-merge two plain objects (second wins on conflict).
 *
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
const deepMerge = (target, source) => {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
};

/**
 * Sleep for n milliseconds (useful for retry back-off).
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Chunk an array into sub-arrays of a given size.
 *
 * @param {Array}  arr
 * @param {number} size
 * @returns {Array[]}
 */
const chunk = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

module.exports = {
  haversineDistance,
  sanitizeUser,
  paginate,
  randomCode,
  toDate,
  deepMerge,
  sleep,
  chunk,
};