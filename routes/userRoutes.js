const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Registration now requires JWT authentication
router.post('/register', authenticate, userController.registerUser);

// Login (OTP-based)
router.post('/login', userController.loginUser);

// Protected route
router.get('/me', authenticate, userController.getProfile);

module.exports = router;
