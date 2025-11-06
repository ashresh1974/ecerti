const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Example endpoints (expand as needed)
router.get('/user/details', userController.getDetails);
router.post('/certificate/apply', userController.applyCertificate);
// Add further endpoints (download, verify, status, etc.)

module.exports = router;
