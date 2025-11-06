const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/register/send-otp', authController.sendRegisterOtp);
router.post('/register/verify-otp', authController.verifyRegisterOtp);
router.post('/login', authController.login);
router.post('/forgot-password/send-otp', authController.sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', authController.verifyForgotPasswordOtp);
router.post('/forgot-password/reset-password', authController.resetPassword);

module.exports = router;
