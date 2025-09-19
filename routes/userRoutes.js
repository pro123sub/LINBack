const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Registration and login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Aadhaar OTP endpoints
router.post('/request-otp', userController.requestAadhaarOtp);
router.post('/verify-otp', userController.verifyAadhaarOtp);

// Protected user endpoints
router.get('/me', authenticate, userController.getProfile);
router.put('/update', authenticate, userController.updateProfile);

module.exports = router;
