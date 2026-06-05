// src/utils/certificateGenerator.js
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const moment         = require('moment');
const path           = require('path');
const fs             = require('fs');

// ── Ensure temp folder exists ─────────────────────────────────────────────────
const TEMP_DIR = path.join(process.cwd(), 'temp', 'certificates');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// ── Colour palette ────────────────────────────────────────────────────────────
const RED   = '#E53935';
const DARK  = '#1A1A2E';
const LIGHT = '#F5F5F5';
const GOLD  = '#FFD700';

/**
 * Draw the decorative border around the certificate.
 */
const drawBorder = (doc) => {
  const m = 20;
  doc
    .rect(m, m, doc.page.width - m * 2, doc.page.height - m * 2)
    .lineWidth(4)
    .stroke(RED);

  doc
    .rect(m + 6, m + 6, doc.page.width - (m + 6) * 2, doc.page.height - (m + 6) * 2)
    .lineWidth(1)
    .stroke(GOLD);
};

/**
 * Draw the PulseAid logo/header block.
 */
const drawHeader = (doc) => {
  // Red banner
  doc.rect(0, 0, doc.page.width, 100).fill(RED);

  // Brand name
  doc
    .fillColor('#FFFFFF')
    .fontSize(32)
    .font('Helvetica-Bold')
    .text('PulseAid', 0, 28, { align: 'center' });

  // Tagline
  doc
    .fontSize(12)
    .font('Helvetica')
    .text('Every Drop Counts', 0, 68, { align: 'center' });
};

/**
 * Certificate type labels & subtitles.
 */
const CERT_META = {
  appreciation: {
    title:    'Certificate of Appreciation',
    subtitle: 'In recognition of your generous blood donation',
  },
  hero: {
    title:    'Certificate of Hero',
    subtitle: 'Awarded to a true life-saving hero',
  },
  lifesaver: {
    title:    'Certificate of Life Saver',
    subtitle: 'For saving lives through the gift of blood',
  },
};

/**
 * Generate a donation certificate PDF and return its file path.
 *
 * @param {object} data
 * @param {string} data.donorName
 * @param {string} data.bloodGroup
 * @param {number} data.units
 * @param {string} data.hospitalName
 * @param {string} data.donationDate   – ISO string
 * @param {string} [data.type]         – appreciation | hero | lifesaver
 * @param {string} [data.donorId]
 * @returns {Promise<{filePath: string, certificateId: string}>}
 */
const generateCertificate = (data) => {
  return new Promise((resolve, reject) => {
    const {
      donorName,
      bloodGroup,
      units,
      hospitalName,
      donationDate,
      type = 'appreciation',
      donorId = 'N/A',
    } = data;

    const meta          = CERT_META[type] || CERT_META.appreciation;
    const certificateId = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const fileName      = `${certificateId}.pdf`;
    const filePath      = path.join(TEMP_DIR, fileName);

    const doc = new PDFDocument({
      size:    'A4',
      layout:  'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ── Background ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(LIGHT);

    drawHeader(doc);
    drawBorder(doc);

    // ── Certificate Type ───────────────────────────────────────────────────
    doc
      .fillColor(RED)
      .fontSize(26)
      .font('Helvetica-Bold')
      .text(meta.title, 0, 120, { align: 'center' });

    doc
      .fillColor(DARK)
      .fontSize(13)
      .font('Helvetica-Oblique')
      .text(meta.subtitle, 0, 154, { align: 'center' });

    // ── Divider ────────────────────────────────────────────────────────────
    const pw = doc.page.width;
    doc.moveTo(60, 180).lineTo(pw - 60, 180).lineWidth(1).stroke(RED);

    // ── Body ───────────────────────────────────────────────────────────────
    doc
      .fillColor(DARK)
      .fontSize(14)
      .font('Helvetica')
      .text('This certificate is proudly presented to', 0, 200, { align: 'center' });

    doc
      .fillColor(RED)
      .fontSize(34)
      .font('Helvetica-Bold')
      .text(donorName, 0, 224, { align: 'center' });

    doc
      .fillColor(DARK)
      .fontSize(14)
      .font('Helvetica')
      .text(
        `For the generous donation of ${units} unit(s) of ${bloodGroup} blood`,
        0, 272, { align: 'center' }
      );

    doc
      .fontSize(13)
      .text(`at ${hospitalName}`, 0, 296, { align: 'center' });

    doc
      .fontSize(13)
      .text(`on ${moment(donationDate).format('DD MMMM, YYYY')}`, 0, 316, { align: 'center' });

    // ── Divider ────────────────────────────────────────────────────────────
    doc.moveTo(60, 350).lineTo(pw - 60, 350).lineWidth(1).stroke(RED);

    // ── Footer row ─────────────────────────────────────────────────────────
    const footerY = 365;

    doc.fillColor(DARK).fontSize(11).font('Helvetica');

    // Left – Certificate ID
    doc.text(`Certificate ID: ${certificateId}`, 60, footerY);
    doc.text(`Donor ID: ${donorId}`, 60, footerY + 16);

    // Centre – Heart icon substitute
    doc
      .fillColor(RED)
      .fontSize(28)
      .text('♥', 0, footerY - 4, { align: 'center' });

    // Right – Signature block
    doc
      .fillColor(DARK)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('PulseAid Authority', pw - 200, footerY + 26, { width: 140, align: 'center' });

    doc
      .moveTo(pw - 200, footerY + 20)
      .lineTo(pw - 60, footerY + 20)
      .lineWidth(1)
      .stroke(DARK);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text(`Issued: ${moment().format('DD MMM YYYY')}`, pw - 200, footerY + 40, {
        width: 140, align: 'center',
      });

    doc.end();

    stream.on('finish', () => resolve({ filePath, certificateId, fileName }));
    stream.on('error',  reject);
  });
};

module.exports = { generateCertificate };