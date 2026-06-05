// src/controllers/bloodRequestController.js
'use strict';

const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp, increment } = require('../config/firebase');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');
const { emitToUser, emitToRole, emitToRoom } = require('../config/socket');
const donorMatchingService = require('../services/donorMatchingService');
const notificationService  = require('../services/notificationService');

// ── Create Blood Request ───────────────────────────────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const {
      bloodGroup, units, hospitalName, location,
      neededByDate, requestType, additionalNotes, patientName,
    } = req.body;

    const db        = getDb();
    const requestId = uuidv4();

    const requestDoc = {
      requestId,
      requestedBy:    req.user.uid,
      requesterName:  req.user.name,
      requesterRole:  req.user.role,
      bloodGroup,
      units:          Number(units),
      unitsFullfilled: 0,
      hospitalName,
      location: {
        latitude:  location.latitude,
        longitude: location.longitude,
        address:   location.address,
      },
      neededByDate,
      requestType,                       // emergency | normal
      additionalNotes: additionalNotes || '',
      patientName:     patientName || '',
      status:          'pending',        // pending | active | fulfilled | cancelled
      acceptedDonors:  [],
      rejectedDonors:  [],
      createdAt:       serverTimestamp(),
      updatedAt:       serverTimestamp(),
    };

    await db.collection(collections.REQUESTS).doc(requestId).set(requestDoc);

    // Find & notify nearby donors asynchronously
    setImmediate(async () => {
      try {
        const donors = await donorMatchingService.findNearestDonors({
          bloodGroup,
          latitude:  location.latitude,
          longitude: location.longitude,
          radius:    10,  // km
          limit:     20,
        });

        // Notify matching donors
        for (const donor of donors) {
          await notificationService.sendToUser(donor.uid, {
            title:   requestType === 'emergency' ? '🆘 Emergency Blood Request' : '🩸 Blood Request Nearby',
            body:    `${bloodGroup} blood needed at ${hospitalName}. ${units} unit(s) required.`,
            data:    { type: 'blood_request', requestId },
          });
          emitToUser(donor.uid, 'new_blood_request', { requestId, bloodGroup, hospitalName, requestType });
        }

        // Also emit to hospital/org role room
        emitToRole('hospital', 'new_blood_request', { requestId, bloodGroup, hospitalName, requestType });
      } catch (err) {
        logger.error('Async donor notification failed:', err);
      }
    });

    return successResponse(res, { request: requestDoc }, 'Blood request created successfully', 201);
  } catch (error) {
    logger.error('Create blood request error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get All Requests (filterable) ─────────────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const db = getDb();
    const { bloodGroup, status, requestType, page = 1, limit = 20 } = req.query;

    let query = db.collection(collections.REQUESTS).orderBy('createdAt', 'desc');

    if (bloodGroup)   query = query.where('bloodGroup', '==', bloodGroup);
    if (status)       query = query.where('status', '==', status);
    if (requestType)  query = query.where('requestType', '==', requestType);

    // Role-based filtering
    if (req.user.role === 'user' || req.user.role === 'donor') {
      query = query.where('requestedBy', '==', req.user.uid);
    }

    const snap  = await query.get();
    const total = snap.size;
    const offset = (Number(page) - 1) * Number(limit);
    const docs   = snap.docs.slice(offset, offset + Number(limit));
    const requests = docs.map((d) => d.data());

    return paginatedResponse(
      res,
      requests,
      { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
      'Blood requests fetched'
    );
  } catch (error) {
    logger.error('Get all requests error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Single Request ────────────────────────────────────────────────────────
exports.getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const db = getDb();
    const snap = await db.collection(collections.REQUESTS).doc(requestId).get();

    if (!snap.exists) return errorResponse(res, 'Blood request not found.', 404);

    return successResponse(res, { request: snap.data() }, 'Request fetched');
  } catch (error) {
    logger.error('Get request error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Update Request Status ─────────────────────────────────────────────────────
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status }    = req.body;
    const db            = getDb();

    const snap = await db.collection(collections.REQUESTS).doc(requestId).get();
    if (!snap.exists) return errorResponse(res, 'Request not found.', 404);

    const request = snap.data();

    // Only requester or admin can update
    if (request.requestedBy !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to update this request.', 403);
    }

    await db.collection(collections.REQUESTS).doc(requestId).update({
      status,
      updatedAt: serverTimestamp(),
    });

    emitToRoom(`request:${requestId}`, 'request_status_updated', { requestId, status });

    return successResponse(res, { requestId, status }, 'Request status updated');
  } catch (error) {
    logger.error('Update request status error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Donor: Accept / Reject Request ───────────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action }    = req.body; // 'accept' | 'reject'
    const db            = getDb();

    const snap = await db.collection(collections.REQUESTS).doc(requestId).get();
    if (!snap.exists) return errorResponse(res, 'Request not found.', 404);

    const request = snap.data();

    if (request.status === 'fulfilled' || request.status === 'cancelled') {
      return errorResponse(res, `Request is already ${request.status}.`, 400);
    }

    const fieldToUpdate = action === 'accept' ? 'acceptedDonors' : 'rejectedDonors';
    const otherField    = action === 'accept' ? 'rejectedDonors' : 'acceptedDonors';

    const donorEntry = {
      uid:        req.user.uid,
      name:       req.user.name,
      bloodGroup: req.user.bloodGroup,
      respondedAt: new Date().toISOString(),
    };

    // Remove from other list, add to this list
    const otherList  = (request[otherField]  || []).filter(d => d.uid !== req.user.uid);
    const updateList = [...(request[fieldToUpdate] || []).filter(d => d.uid !== req.user.uid), donorEntry];

    const updates = {
      [fieldToUpdate]: updateList,
      [otherField]:    otherList,
      updatedAt:       serverTimestamp(),
    };

    if (action === 'accept' && request.status === 'pending') {
      updates.status = 'active';
    }

    await db.collection(collections.REQUESTS).doc(requestId).update(updates);

    // Notify requester
    await notificationService.sendToUser(request.requestedBy, {
      title: action === 'accept' ? '✅ Donor Accepted' : 'Donor Response',
      body:  `${req.user.name} has ${action}ed your blood request.`,
      data:  { type: 'donor_response', requestId, action },
    });

    emitToUser(request.requestedBy, 'donor_responded', {
      requestId, donorId: req.user.uid, donorName: req.user.name, action,
    });

    return successResponse(res, {}, `Request ${action}ed successfully`);
  } catch (error) {
    logger.error('Respond to request error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Requests Near Me (Donor view) ────────────────────────────────────────
exports.getNearbyRequests = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, bloodGroup } = req.query;
    if (!latitude || !longitude) return errorResponse(res, 'latitude and longitude required.', 400);

    const db = getDb();
    let query = db.collection(collections.REQUESTS)
      .where('status', 'in', ['pending', 'active'])
      .orderBy('createdAt', 'desc');

    if (bloodGroup) query = query.where('bloodGroup', '==', bloodGroup);

    const snap = await query.get();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    const nearby = snap.docs
      .map((d) => d.data())
      .filter((r) => {
        const dist = calculateDistance(lat, lng, r.location.latitude, r.location.longitude);
        return dist <= rad;
      })
      .map((r) => ({
        ...r,
        distance: calculateDistance(lat, lng, r.location.latitude, r.location.longitude).toFixed(2),
      }))
      .sort((a, b) => a.distance - b.distance);

    return successResponse(res, { requests: nearby, total: nearby.length }, 'Nearby requests fetched');
  } catch (error) {
    logger.error('Get nearby requests error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Delete / Cancel Request ───────────────────────────────────────────────────
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const db            = getDb();

    const snap = await db.collection(collections.REQUESTS).doc(requestId).get();
    if (!snap.exists) return errorResponse(res, 'Request not found.', 404);

    const request = snap.data();
    if (request.requestedBy !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    await db.collection(collections.REQUESTS).doc(requestId).update({
      status:    'cancelled',
      updatedAt: serverTimestamp(),
    });

    emitToRoom(`request:${requestId}`, 'request_cancelled', { requestId });

    return successResponse(res, {}, 'Request cancelled');
  } catch (error) {
    logger.error('Cancel request error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Mark Request as Fulfilled ─────────────────────────────────────────────────
exports.fulfillRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { donorIds }  = req.body; // array of donor UIDs who donated
    const db            = getDb();

    const snap = await db.collection(collections.REQUESTS).doc(requestId).get();
    if (!snap.exists) return errorResponse(res, 'Request not found.', 404);

    const request = snap.data();

    await db.collection(collections.REQUESTS).doc(requestId).update({
      status:     'fulfilled',
      donorIds:   donorIds || [],
      fulfilledAt: serverTimestamp(),
      updatedAt:  serverTimestamp(),
    });

    // Increment donor stats and trigger certificate generation
    if (donorIds && donorIds.length > 0) {
      const batch = db.batch();
      for (const donorId of donorIds) {
        const donorRef = db.collection(collections.DONORS).doc(donorId);
        batch.update(donorRef, {
          totalDonations:  increment(1),
          livesSaved:      increment(request.units || 1),
          lastDonationDate: serverTimestamp(),
          updatedAt:       serverTimestamp(),
        });
      }
      await batch.commit();

      // Send notifications to donors
      for (const donorId of donorIds) {
        await notificationService.sendToUser(donorId, {
          title: '🎉 Thank You for Saving Lives!',
          body:  `Your donation for ${request.bloodGroup} blood at ${request.hospitalName} has been confirmed.`,
          data:  { type: 'donation_confirmed', requestId },
        });
      }
    }

    return successResponse(res, {}, 'Request marked as fulfilled');
  } catch (error) {
    logger.error('Fulfill request error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Haversine Distance Helper ─────────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}