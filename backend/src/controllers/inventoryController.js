// src/controllers/inventoryController.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const moment         = require('moment');
const { getDb, collections, serverTimestamp, increment } = require('../config/firebase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

// ── Get Inventory (org scoped) ────────────────────────────────────────────────
exports.getInventory = async (req, res) => {
  try {
    const db = getDb();
    const orgId = req.query.orgId || req.user.uid;

    // Admin can query any org; orgs can only see their own
    if (req.user.role !== 'admin' && orgId !== req.user.uid) {
      return errorResponse(res, 'Not authorized.', 403);
    }

    const snap = await db.collection(collections.INVENTORY)
      .where('orgId', '==', orgId)
      .orderBy('bloodGroup', 'asc')
      .get();

    const inventory = snap.docs.map((d) => d.data());

    // Summary aggregation
    const summary = {};
    for (const item of inventory) {
      if (!summary[item.bloodGroup]) {
        summary[item.bloodGroup] = { bloodGroup: item.bloodGroup, totalUnits: 0, expiringSoon: 0 };
      }
      summary[item.bloodGroup].totalUnits += item.units;
      if (moment(item.expiryDate).diff(moment(), 'days') <= 7) {
        summary[item.bloodGroup].expiringSoon += item.units;
      }
    }

    return successResponse(res, {
      inventory,
      summary:    Object.values(summary),
      totalItems: inventory.length,
    }, 'Inventory fetched');
  } catch (error) {
    logger.error('Get inventory error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Add Stock ─────────────────────────────────────────────────────────────────
exports.addStock = async (req, res) => {
  try {
    const { bloodGroup, units, expiryDate, donorId, batchNumber, notes } = req.body;
    const db       = getDb();
    const itemId   = uuidv4();

    const inventoryItem = {
      itemId,
      orgId:       req.user.uid,
      orgName:     req.user.name,
      bloodGroup,
      units:       Number(units),
      expiryDate,
      donorId:     donorId || null,
      batchNumber: batchNumber || `BATCH-${itemId.slice(0, 6).toUpperCase()}`,
      notes:       notes || '',
      status:      'available',   // available | reserved | used | expired
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
    };

    await db.collection(collections.INVENTORY).doc(itemId).set(inventoryItem);

    return successResponse(res, { item: inventoryItem }, 'Stock added successfully', 201);
  } catch (error) {
    logger.error('Add stock error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Stock ──────────────────────────────────────────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const { itemId }            = req.params;
    const { units, expiryDate, status, notes } = req.body;
    const db                    = getDb();

    const snap = await db.collection(collections.INVENTORY).doc(itemId).get();
    if (!snap.exists) return errorResponse(res, 'Inventory item not found.', 404);

    const item = snap.data();
    if (item.orgId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    const updates = { updatedAt: serverTimestamp() };
    if (units !== undefined)     updates.units      = Number(units);
    if (expiryDate !== undefined) updates.expiryDate = expiryDate;
    if (status !== undefined)    updates.status     = status;
    if (notes !== undefined)     updates.notes      = notes;

    await db.collection(collections.INVENTORY).doc(itemId).update(updates);

    return successResponse(res, { itemId }, 'Stock updated');
  } catch (error) {
    logger.error('Update stock error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete Stock ──────────────────────────────────────────────────────────────
exports.deleteStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const db         = getDb();

    const snap = await db.collection(collections.INVENTORY).doc(itemId).get();
    if (!snap.exists) return errorResponse(res, 'Inventory item not found.', 404);

    const item = snap.data();
    if (item.orgId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    await db.collection(collections.INVENTORY).doc(itemId).delete();

    return successResponse(res, {}, 'Stock deleted');
  } catch (error) {
    logger.error('Delete stock error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Expiring Stock ────────────────────────────────────────────────────────
exports.getExpiringStock = async (req, res) => {
  try {
    const db      = getDb();
    const days    = parseInt(req.query.days) || 7;
    const cutoff  = moment().add(days, 'days').toISOString();

    let query = db.collection(collections.INVENTORY)
      .where('status', '==', 'available')
      .where('expiryDate', '<=', cutoff);

    if (req.user.role !== 'admin') {
      query = query.where('orgId', '==', req.user.uid);
    }

    const snap  = await query.orderBy('expiryDate', 'asc').get();
    const items = snap.docs.map((d) => ({
      ...d.data(),
      daysUntilExpiry: moment(d.data().expiryDate).diff(moment(), 'days'),
    }));

    return successResponse(res, { items, total: items.length }, 'Expiring stock fetched');
  } catch (error) {
    logger.error('Get expiring stock error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Search Inventory Across All Orgs (for blood request matching) ─────────────
exports.searchInventory = async (req, res) => {
  try {
    const { bloodGroup, units = 1, latitude, longitude, radius = 20 } = req.query;
    const db = getDb();

    let query = db.collection(collections.INVENTORY)
      .where('status', '==', 'available')
      .where('bloodGroup', '==', bloodGroup)
      .where('units', '>=', parseInt(units));

    const snap    = await query.get();
    let results   = snap.docs.map((d) => d.data());

    // If lat/lng provided, sort by distance
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Need org locations — enrich with org data
      const orgIds  = [...new Set(results.map((r) => r.orgId))];
      const orgSnaps = await Promise.all(
        orgIds.map((id) => db.collection(collections.USERS).doc(id).get())
      );
      const orgMap = {};
      orgSnaps.forEach((s) => {
        if (s.exists) orgMap[s.id] = s.data();
      });

      results = results
        .map((item) => {
          const org  = orgMap[item.orgId];
          const dist = org
            ? haversine(lat, lng, org.latitude, org.longitude)
            : Infinity;
          return { ...item, orgAddress: org?.address, distance: parseFloat(dist.toFixed(2)) };
        })
        .filter((item) => item.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance);
    }

    return successResponse(res, { results, total: results.length }, 'Inventory search results');
  } catch (error) {
    logger.error('Search inventory error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Reserve Units ─────────────────────────────────────────────────────────────
exports.reserveUnits = async (req, res) => {
  try {
    const { itemId }   = req.params;
    const { units, requestId } = req.body;
    const db           = getDb();

    const snap = await db.collection(collections.INVENTORY).doc(itemId).get();
    if (!snap.exists) return errorResponse(res, 'Item not found.', 404);

    const item = snap.data();
    if (item.units < units) return errorResponse(res, 'Insufficient units.', 400);

    await db.collection(collections.INVENTORY).doc(itemId).update({
      units:     item.units - Number(units),
      status:    item.units - Number(units) === 0 ? 'used' : 'available',
      reservedFor: requestId,
      updatedAt: serverTimestamp(),
    });

    return successResponse(res, {}, `${units} unit(s) reserved`);
  } catch (error) {
    logger.error('Reserve units error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Haversine helper ──────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  if (!lat2 || !lon2) return Infinity;
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}