// src/controllers/analyticsController.js
'use strict';

const moment = require('moment');
const { getDb, collections } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logger } = require('../utils/logger');

// ── Admin Dashboard Stats ─────────────────────────────────────────────────────
exports.getAdminStats = async (req, res) => {
  try {
    const db = getDb();

    const [usersSnap, donorsSnap, requestsSnap, orgsSnap] = await Promise.all([
      db.collection(collections.USERS).get(),
      db.collection(collections.DONORS).get(),
      db.collection(collections.REQUESTS).get(),
      db.collection(collections.USERS).where('role', 'in', ['hospital', 'ngo', 'blood_bank']).get(),
    ]);

    const requests = requestsSnap.docs.map((d) => d.data());

    const pendingRequests   = requests.filter((r) => r.status === 'pending').length;
    const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled').length;
    const activeRequests    = requests.filter((r) => r.status === 'active').length;

    // Donor verification stats
    const donorData    = donorsSnap.docs.map((d) => d.data());
    const pendingDonors   = donorData.filter((d) => !d.isVerified).length;
    const verifiedDonors  = donorData.filter((d) =>  d.isVerified).length;

    // Recent activity (last 7 days)
    const weekAgo = moment().subtract(7, 'days').toISOString();
    const recentRequests = requests.filter(
      (r) => r.createdAt && moment(r.createdAt.toDate?.() || r.createdAt).isAfter(weekAgo)
    ).length;

    // Blood group distribution
    const bloodGroupDist = {};
    donorData.forEach((d) => {
      if (d.bloodGroup) {
        bloodGroupDist[d.bloodGroup] = (bloodGroupDist[d.bloodGroup] || 0) + 1;
      }
    });

    return successResponse(res, {
      overview: {
        totalUsers:       usersSnap.size,
        totalDonors:      donorsSnap.size,
        totalRequests:    requestsSnap.size,
        totalOrganizations: orgsSnap.size,
      },
      requests: {
        total:     requestsSnap.size,
        pending:   pendingRequests,
        active:    activeRequests,
        fulfilled: fulfilledRequests,
        recentWeek: recentRequests,
      },
      donors: {
        total:    donorsSnap.size,
        pending:  pendingDonors,
        verified: verifiedDonors,
        bloodGroupDistribution: bloodGroupDist,
      },
    }, 'Admin stats fetched');
  } catch (error) {
    logger.error('Get admin stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Donor Dashboard Stats ─────────────────────────────────────────────────────
exports.getDonorStats = async (req, res) => {
  try {
    const db       = getDb();
    const donorId  = req.params.donorId || req.user.uid;

    const donorSnap = await db.collection(collections.DONORS).doc(donorId).get();
    if (!donorSnap.exists) return errorResponse(res, 'Donor not found.', 404);

    const donor = donorSnap.data();

    // Donation history
    const historySnap = await db.collection(collections.REQUESTS)
      .where('donorIds', 'array-contains', donorId)
      .where('status', '==', 'fulfilled')
      .orderBy('createdAt', 'desc')
      .get();

    const history = historySnap.docs.map((d) => d.data());

    // Monthly donations (last 6 months)
    const monthlyDonations = {};
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('MMM YYYY');
      monthlyDonations[month] = 0;
    }
    history.forEach((r) => {
      if (r.createdAt) {
        const month = moment(r.createdAt.toDate?.() || r.createdAt).format('MMM YYYY');
        if (monthlyDonations[month] !== undefined) monthlyDonations[month]++;
      }
    });

    // Certificates count
    const certsSnap = await db.collection(collections.CERTIFICATES)
      .where('donorId', '==', donorId)
      .get();

    // Pending requests nearby
    const pendingRequestsSnap = await db.collection(collections.REQUESTS)
      .where('status', 'in', ['pending', 'active'])
      .get();
    const pendingNearby = pendingRequestsSnap.size;

    return successResponse(res, {
      profile: {
        name:           donor.name,
        bloodGroup:     donor.bloodGroup,
        totalDonations: donor.totalDonations || 0,
        livesSaved:     donor.livesSaved || 0,
        rating:         donor.rating || 0,
        isAvailable:    donor.isAvailable,
        lastDonation:   donor.lastDonationDate,
      },
      stats: {
        totalDonations:   donor.totalDonations || 0,
        livesSaved:       donor.livesSaved || 0,
        certificatesEarned: certsSnap.size,
        pendingNearbyRequests: pendingNearby,
      },
      monthlyDonations,
      recentDonations: history.slice(0, 5),
    }, 'Donor stats fetched');
  } catch (error) {
    logger.error('Get donor stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Organization Dashboard Stats ──────────────────────────────────────────────
exports.getOrgStats = async (req, res) => {
  try {
    const db    = getDb();
    const orgId = req.params.orgId || req.user.uid;

    if (req.user.role !== 'admin' && orgId !== req.user.uid) {
      return errorResponse(res, 'Not authorized.', 403);
    }

    const [requestsSnap, inventorySnap] = await Promise.all([
      db.collection(collections.REQUESTS).where('requestedBy', '==', orgId).get(),
      db.collection(collections.INVENTORY).where('orgId', '==', orgId).get(),
    ]);

    const requests  = requestsSnap.docs.map((d) => d.data());
    const inventory = inventorySnap.docs.map((d) => d.data());

    const fulfilled = requests.filter((r) => r.status === 'fulfilled').length;
    const pending   = requests.filter((r) => r.status === 'pending').length;
    const active    = requests.filter((r) => r.status === 'active').length;

    // Inventory summary
    const inventorySummary = {};
    inventory.forEach((item) => {
      if (!inventorySummary[item.bloodGroup]) {
        inventorySummary[item.bloodGroup] = 0;
      }
      inventorySummary[item.bloodGroup] += item.units;
    });

    // Recent requests
    const recent = requests
      .sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return tb - ta;
      })
      .slice(0, 10);

    return successResponse(res, {
      requests: {
        total:     requestsSnap.size,
        fulfilled,
        pending,
        active,
      },
      inventory: {
        totalItems: inventorySnap.size,
        summary:    inventorySummary,
      },
      recentRequests: recent,
    }, 'Organization stats fetched');
  } catch (error) {
    logger.error('Get org stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Blood Request Trends ──────────────────────────────────────────────────────
exports.getRequestTrends = async (req, res) => {
  try {
    const db      = getDb();
    const { days = 30 } = req.query;

    const snap    = await db.collection(collections.REQUESTS)
      .orderBy('createdAt', 'desc')
      .get();

    const cutoff  = moment().subtract(parseInt(days), 'days');
    const requests = snap.docs
      .map((d) => d.data())
      .filter((r) => r.createdAt && moment(r.createdAt.toDate?.() || r.createdAt).isAfter(cutoff));

    // Group by day
    const daily = {};
    requests.forEach((r) => {
      const day = moment(r.createdAt.toDate?.() || r.createdAt).format('YYYY-MM-DD');
      if (!daily[day]) daily[day] = { total: 0, emergency: 0, normal: 0, fulfilled: 0 };
      daily[day].total++;
      if (r.requestType === 'emergency') daily[day].emergency++;
      else daily[day].normal++;
      if (r.status === 'fulfilled') daily[day].fulfilled++;
    });

    // Blood group demand
    const bloodGroupDemand = {};
    requests.forEach((r) => {
      bloodGroupDemand[r.bloodGroup] = (bloodGroupDemand[r.bloodGroup] || 0) + 1;
    });

    return successResponse(res, {
      daily: Object.entries(daily).map(([date, counts]) => ({ date, ...counts })),
      bloodGroupDemand,
      totalRequests: requests.length,
      period: `${days} days`,
    }, 'Request trends fetched');
  } catch (error) {
    logger.error('Get request trends error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Leaderboard (Top Donors) ──────────────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const db    = getDb();
    const limit = parseInt(req.query.limit) || 10;

    const snap = await db.collection(collections.DONORS)
      .where('isVerified', '==', true)
      .orderBy('totalDonations', 'desc')
      .limit(limit)
      .get();

    const donors = snap.docs.map((d, idx) => {
      const { passwordHash, refreshTokenHash, fcmTokens, latitude, longitude, ...safe } = d.data();
      return { rank: idx + 1, ...safe };
    });

    return successResponse(res, { leaderboard: donors }, 'Leaderboard fetched');
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    return errorResponse(res, error.message, 500);
  }
};