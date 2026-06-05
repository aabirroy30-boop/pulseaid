// src/services/donorMatchingService.js
'use strict';

const { getDb, collections } = require('../config/firebase');
const { logger }             = require('../utils/logger');

// ── Blood group compatibility map ─────────────────────────────────────────────
// Key = requested blood group → Value = compatible donor blood groups (can donate to)
const COMPATIBILITY = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],   // universal donor
};

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
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
}

/**
 * Find donors who match a blood request.
 *
 * @param {object} options
 * @param {string}  options.bloodGroup   – requested blood group (e.g. 'A+')
 * @param {number}  options.latitude     – request location
 * @param {number}  options.longitude
 * @param {number}  [options.radius=10]  – search radius in km
 * @param {number}  [options.limit=20]   – max results
 * @param {boolean} [options.strictMatch=false] – if true, only exact blood group match
 * @returns {Promise<Array>}             – sorted by distance ascending
 */
const findNearestDonors = async ({
  bloodGroup,
  latitude,
  longitude,
  radius    = 10,
  limit     = 20,
  strictMatch = false,
}) => {
  try {
    const db = getDb();

    // Decide compatible blood groups
    const compatibleGroups = strictMatch
      ? [bloodGroup]
      : (COMPATIBILITY[bloodGroup] || [bloodGroup]);

    // Fetch verified, available donors
    let query = db.collection(collections.DONORS)
      .where('isVerified',  '==', true)
      .where('isAvailable', '==', true);

    // Firestore 'in' supports up to 10 items per query; split if needed
    let donors = [];

    const chunks = [];
    for (let i = 0; i < compatibleGroups.length; i += 10) {
      chunks.push(compatibleGroups.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const snap = await db.collection(collections.DONORS)
        .where('isVerified',  '==', true)
        .where('isAvailable', '==', true)
        .where('bloodGroup',  'in', chunk)
        .get();

      donors = donors.concat(snap.docs.map((d) => d.data()));
    }

    // Filter by radius and add distance
    const nearby = donors
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => ({
        ...d,
        distance: parseFloat(
          haversine(latitude, longitude, d.latitude, d.longitude).toFixed(2)
        ),
      }))
      .filter((d) => d.distance <= radius)
      .sort((a, b) => {
        // Primary: distance, Secondary: rating (desc)
        if (a.distance !== b.distance) return a.distance - b.distance;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, limit)
      .map(({ passwordHash, refreshTokenHash, fcmTokens, ...safe }) => safe); // strip sensitive fields

    logger.info(
      `Donor match: blood=${bloodGroup}, lat=${latitude}, lng=${longitude}, ` +
      `radius=${radius}km → ${nearby.length} donors found`
    );

    return nearby;
  } catch (error) {
    logger.error('findNearestDonors error:', error);
    throw error;
  }
};

/**
 * Check if a specific donor is compatible with a blood request.
 *
 * @param {string} donorBloodGroup
 * @param {string} requestedBloodGroup
 * @returns {boolean}
 */
const isCompatible = (donorBloodGroup, requestedBloodGroup) => {
  const compatibles = COMPATIBILITY[requestedBloodGroup] || [];
  return compatibles.includes(donorBloodGroup);
};

/**
 * Get donors within radius without blood group filtering (for generic nearby search).
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [radius=10]
 * @param {number} [limit=20]
 * @returns {Promise<Array>}
 */
const getDonorsInRadius = async (latitude, longitude, radius = 10, limit = 20) => {
  try {
    const db   = getDb();
    const snap = await db.collection(collections.DONORS)
      .where('isVerified',  '==', true)
      .where('isAvailable', '==', true)
      .get();

    return snap.docs
      .map((d) => d.data())
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => ({
        ...d,
        distance: parseFloat(
          haversine(latitude, longitude, d.latitude, d.longitude).toFixed(2)
        ),
      }))
      .filter((d) => d.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(({ passwordHash, refreshTokenHash, fcmTokens, ...safe }) => safe);
  } catch (error) {
    logger.error('getDonorsInRadius error:', error);
    throw error;
  }
};

module.exports = {
  findNearestDonors,
  isCompatible,
  getDonorsInRadius,
  COMPATIBILITY,
};