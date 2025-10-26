// controllers/userController.js
const asyncHandler = require('express-async-handler');
const userService = require('../services/userServices'); // make sure filename matches
const logger = require('../utils/logger');

// ✅ Basic Registration (Step 3.1 after OTP verify)
const registerUser = asyncHandler(async (req, res) => {
  try {
    logger.info(`[USER CONTROLLER] registerUser called with body: ${JSON.stringify(req.body)}`);
    logger.info(`[USER CONTROLLER] req.user: ${JSON.stringify(req.user)}`);

    const userId = req.user.id; // JWT middleware stores decoded user data
    const result = await userService.registerUser(userId, req.body);

    logger.info(`[USER CONTROLLER] Registration successful for userId: ${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[USER CONTROLLER] Error in registerUser: ${err.message}`);
    throw err;
  }
});

// ✅ Get Logged-In User Profile
const getProfile = asyncHandler(async (req, res) => {
  try {
    logger.info(`[USER CONTROLLER] getProfile called for userId: ${req.user.id}`);
    const user = await userService.getProfile(req.user.id);
    logger.info(`[USER CONTROLLER] Profile fetched successfully for userId: ${req.user.id}`);

    res.json({
      message: 'Profile fetched successfully.',
      user
    });
  } catch (err) {
    logger.error(`[USER CONTROLLER] Error in getProfile: ${err.message}`);
    throw err;
  }
});

// ✅ TEMP: Login (Only till email login features exist)
const loginUser = asyncHandler(async (req, res) => {
  logger.info('[USER CONTROLLER] loginUser called — Email login temporarily disabled');
  res.status(501).json({
    message: "Email login temporarily disabled — login via phone OTP only."
  });
});

module.exports = {
  registerUser,
  getProfile,
  loginUser
};
