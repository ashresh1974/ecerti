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

module.exports = router;
