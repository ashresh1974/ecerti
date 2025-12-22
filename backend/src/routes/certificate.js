// routes/certificate.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// POST: Student applies for certificate
router.post('/apply', certificateController.applyCertificate);

// GET: Dashboard statistics for admin
router.get('/stats', certificateController.getCertificateStats);

// GET: Recent activity for dashboard table
router.get('/recent', certificateController.getRecentCertificates);

// GET: Issued certificates for admin dashboard
router.get('/issued', certificateController.getIssuedCertificates);

// GET: Certificate details by reference number
router.get('/details/:reference_num', certificateController.getCertificateDetails);

// GET: Verify certificate (public, no auth needed)
router.get('/verify/:reference_num', certificateController.verifyCertificate);

// POST: Approve certificate
router.post('/approve/:reference_num', certificateController.approveCertificate);

// POST: Reject certificate
router.post('/reject/:reference_num', certificateController.rejectCertificate);

// POST: Re-apply certificate (set to pending)
router.post('/reapply/:reference_num', certificateController.reapplyCertificate);

// GET: Student certificates
router.get('/student', certificateController.getStudentCertificates);

// POST: Generate and store certificate PDF
router.post('/generate/:reference_num', certificateController.generateAndStoreCertificate);

// GET: Download certificate PDF
router.get('/download/:reference_num', certificateController.downloadCertificate);

// GET: QR verification logs
router.get('/qr-logs', certificateController.getQRVerificationLogs);

module.exports = router;
