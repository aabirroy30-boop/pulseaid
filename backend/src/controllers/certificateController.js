// src/controllers/certificateController.js
'use strict';

const path           = require('path');
const fs             = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb, collections, serverTimestamp, getStorage } = require('../config/firebase');
const { successResponse, errorResponse }                  = require('../utils/apiResponse');
const { generateCertificate }                             = require('../utils/certificateGenerator');
const { logger }                                          = require('../utils/logger');
const notificationService                                 = require('../services/notificationService');

// ── Issue Certificate ─────────────────────────────────────────────────────────
exports.issueCertificate = async (req, res) => {
  try {
    const {
      donorId, requestId, donorName, bloodGroup,
      units, hospitalName, donationDate,
      type = 'appreciation',
    } = req.body;

    const db = getDb();

    // Validate donor exists
    const donorSnap = await db.collection(collections.DONORS).doc(donorId).get();
    if (!donorSnap.exists) return errorResponse(res, 'Donor not found.', 404);

    // Generate PDF
    const { filePath, certificateId, fileName } = await generateCertificate({
      donorName,
      bloodGroup,
      units,
      hospitalName,
      donationDate,
      type,
      donorId,
    });

    // Upload to Firebase Storage
    let downloadUrl = null;
    try {
      const bucket  = getStorage().bucket();
      const destPath = `certificates/${certificateId}.pdf`;
      await bucket.upload(filePath, {
        destination: destPath,
        metadata: { contentType: 'application/pdf' },
      });
      const [url] = await bucket.file(destPath).getSignedUrl({
        action:  'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      });
      downloadUrl = url;
    } catch (storageErr) {
      logger.warn('Firebase Storage upload failed, using local path:', storageErr.message);
      downloadUrl = `/api/v1/certificates/download/${certificateId}`;
    }

    // Save record to Firestore
    const certRecord = {
      certificateId,
      donorId,
      donorName,
      requestId:    requestId || null,
      issuedBy:     req.user.uid,
      issuedByName: req.user.name,
      bloodGroup,
      units,
      hospitalName,
      donationDate,
      type,
      downloadUrl,
      localPath:    filePath,
      createdAt:    serverTimestamp(),
    };

    await db.collection(collections.CERTIFICATES).doc(certificateId).set(certRecord);

    // Notify donor
    await notificationService.sendToUser(donorId, {
      title: '🏆 Certificate Issued!',
      body:  `Your ${type} certificate for donating at ${hospitalName} is ready.`,
      data:  { type: 'certificate_issued', certificateId, downloadUrl },
    });

    // Cleanup local file after 5 min
    setTimeout(() => {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }, 5 * 60 * 1000);

    return successResponse(res, { certificate: certRecord, downloadUrl }, 'Certificate issued', 201);
  } catch (error) {
    logger.error('Issue certificate error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get My Certificates ───────────────────────────────────────────────────────
exports.getMyCertificates = async (req, res) => {
  try {
    const db   = getDb();
    const uid  = req.params.donorId || req.user.uid;
    const snap = await db.collection(collections.CERTIFICATES)
      .where('donorId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    const certs = snap.docs.map((d) => d.data());
    return successResponse(res, { certificates: certs, total: certs.length }, 'Certificates fetched');
  } catch (error) {
    logger.error('Get certificates error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Get Certificate by ID ─────────────────────────────────────────────────────
exports.getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const db                = getDb();
    const snap              = await db.collection(collections.CERTIFICATES).doc(certificateId).get();

    if (!snap.exists) return errorResponse(res, 'Certificate not found.', 404);

    const cert = snap.data();
    if (cert.donorId !== req.user.uid && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized.', 403);
    }

    return successResponse(res, { certificate: cert }, 'Certificate fetched');
  } catch (error) {
    logger.error('Get certificate error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Download Certificate (serve local PDF) ────────────────────────────────────
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const db                = getDb();
    const snap              = await db.collection(collections.CERTIFICATES).doc(certificateId).get();

    if (!snap.exists) return errorResponse(res, 'Certificate not found.', 404);

    const cert = snap.data();

    // Try Firebase Storage redirect first
    if (cert.downloadUrl && cert.downloadUrl.startsWith('https://')) {
      return res.redirect(cert.downloadUrl);
    }

    // Fallback to local file
    const TEMP_DIR = path.join(process.cwd(), 'temp', 'certificates');
    const filePath = path.join(TEMP_DIR, `${certificateId}.pdf`);

    if (!fs.existsSync(filePath)) {
      // Regenerate
      const { filePath: regen } = await generateCertificate({
        donorName:    cert.donorName,
        bloodGroup:   cert.bloodGroup,
        units:        cert.units,
        hospitalName: cert.hospitalName,
        donationDate: cert.donationDate,
        type:         cert.type,
        donorId:      cert.donorId,
      });
      return res.download(regen, `PulseAid_Certificate_${certificateId}.pdf`);
    }

    return res.download(filePath, `PulseAid_Certificate_${certificateId}.pdf`);
  } catch (error) {
    logger.error('Download certificate error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Verify Certificate (public endpoint) ─────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const db                = getDb();
    const snap              = await db.collection(collections.CERTIFICATES).doc(certificateId).get();

    if (!snap.exists) {
      return successResponse(res, { valid: false }, 'Certificate not found or invalid');
    }

    const cert = snap.data();
    return successResponse(res, {
      valid:        true,
      certificateId,
      donorName:    cert.donorName,
      bloodGroup:   cert.bloodGroup,
      units:        cert.units,
      hospitalName: cert.hospitalName,
      donationDate: cert.donationDate,
      type:         cert.type,
      issuedAt:     cert.createdAt,
    }, 'Certificate is valid');
  } catch (error) {
    logger.error('Verify certificate error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// ── Auto-issue on fulfilled request ──────────────────────────────────────────
exports.autoIssueCertificates = async (requestId, donorIds, requestData) => {
  const db = getDb();
  for (const donorId of donorIds) {
    try {
      const donorSnap = await db.collection(collections.DONORS).doc(donorId).get();
      if (!donorSnap.exists) continue;

      const donor    = donorSnap.data();
      const type     = donor.totalDonations >= 10 ? 'lifesaver' :
                       donor.totalDonations >= 5  ? 'hero'       : 'appreciation';

      const { filePath, certificateId } = await generateCertificate({
        donorName:    donor.name,
        bloodGroup:   requestData.bloodGroup,
        units:        requestData.units,
        hospitalName: requestData.hospitalName,
        donationDate: new Date().toISOString(),
        type,
        donorId,
      });

      const certRecord = {
        certificateId,
        donorId,
        donorName:  donor.name,
        requestId,
        issuedBy:   'system',
        issuedByName: 'PulseAid System',
        bloodGroup: requestData.bloodGroup,
        units:      requestData.units,
        hospitalName: requestData.hospitalName,
        donationDate: new Date().toISOString(),
        type,
        downloadUrl: `/api/v1/certificates/download/${certificateId}`,
        localPath:   filePath,
        createdAt:   serverTimestamp(),
      };

      await db.collection(collections.CERTIFICATES).doc(certificateId).set(certRecord);

      await notificationService.sendToUser(donorId, {
        title: '🏆 Certificate Issued!',
        body:  `Your ${type} certificate is ready. Thank you for saving lives!`,
        data:  { type: 'certificate_issued', certificateId },
      });

      logger.info(`Auto-issued ${type} certificate ${certificateId} for donor ${donorId}`);
    } catch (err) {
      logger.error(`Auto-issue certificate failed for donor ${donorId}:`, err);
    }
  }
};