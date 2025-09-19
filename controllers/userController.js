const asyncHandler = require('express-async-handler');
const userService = require('../services/userServices');
const { verifyToken } = require('../utils/jwt');

// Register user
const registerUser = asyncHandler(async (req, res) => {
  const result = await userService.registerUser(req.body);
  res.status(201).json({
    message: 'User registered successfully.',
    token: result.token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email
    }
  });
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await userService.loginUser(email, password);
  res.json({
    message: 'Login successful.',
    token: result.token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email
    }
  });
});

// Request Aadhaar OTP
const requestAadhaarOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await userService.requestAadhaarOtp(email);
  res.json(result);
});

// Verify Aadhaar OTP
const verifyAadhaarOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await userService.verifyAadhaarOtp(email, otp);
  res.json(result);
});

// Get logged-in user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  res.json({ message: 'Profile fetched successfully.', user });
});
// Update logged-in user profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Extracted from JWT in auth middleware
  const updatedUser = await userService.updateProfile(userId, req.body);
  res.json({
    message: 'Profile updated successfully.',
    user: updatedUser
  });
});

module.exports = {
  registerUser,
  loginUser,
  requestAadhaarOtp,
  verifyAadhaarOtp,
  getProfile,
  updateProfile
};
