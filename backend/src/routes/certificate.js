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

// POST: Approve certificate
router.post('/approve/:reference_num', certificateController.approveCertificate);

// POST: Reject certificate
router.post('/reject/:reference_num', certificateController.rejectCertificate);

// GET: Student certificates
router.get('/student', certificateController.getStudentCertificates);

// POST: Generate and store certificate PDF
router.post('/generate/:reference_num', certificateController.generateAndStoreCertificate);

// GET: Download certificate PDF
router.get('/download/:reference_num', certificateController.downloadCertificate);

module.exports = router;
