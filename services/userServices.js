const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const UserModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/hash');
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError
} = require('../GlobalExceptionHandler/exception');
const {
  generateOtp,
  getOtpExpiry,
  validateAadhaarNumber
} = require('../utils/aadhaarOtp');
const logger = require('../utils/logger'); // Logger

// =======================
// User Registration
// =======================
async function registerUser(data) {
  logger.info('Register attempt for email: %s', data.email);

  const existingUser = await UserModel.findUserByEmail(data.email);
  if (existingUser) {
    logger.warn('Registration failed: Email already registered - %s', data.email);
    throw new BadRequestError('Email already registered.');
  }

  const hashedPassword = await hashPassword(data.password);

  const userData = {
    ...data,
    password: hashedPassword,
    aadhaarVerified: false,
    verificationStatus: 'PENDING'
  };

  const newUser = await UserModel.createUser(userData);
  logger.info('User registered successfully: %s', newUser.email);

  const token = generateToken(newUser);

  return {
    user: newUser,
    token
  };
}

// =======================
// User Login
// =======================
async function loginUser(email, password) {
  logger.info('Login attempt for email: %s', email);

  const user = await UserModel.findUserByEmail(email);
  if (!user) {
    logger.warn('Login failed: User not found - %s', email);
    throw new UnauthorizedError('Invalid credentials.');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    logger.warn('Login failed: Incorrect password for email - %s', email);
    throw new UnauthorizedError('Invalid credentials.');
  }

  const token = generateToken(user);
  logger.info('Login successful for user: %s', email);

  return { user, token };
}

// =======================
// Request Aadhaar OTP
// =======================
async function requestAadhaarOtp(email) {
  logger.info('Request Aadhaar OTP for email: %s', email);

  const user = await UserModel.findUserByEmail(email);
  if (!user) {
    logger.warn('Request OTP failed: User not found - %s', email);
    throw new NotFoundError('User not found.');
  }

  if (!validateAadhaarNumber(user.aadhaarNumber)) {
    logger.warn('Request OTP failed: Invalid Aadhaar format for user - %s', email);
    throw new BadRequestError('Invalid Aadhaar number format.');
  }

  const otp = generateOtp();
  const otpExpiresAt = getOtpExpiry(5);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCode: otp,
      otpExpiresAt: otpExpiresAt
    }
  });

  logger.info('OTP generated and stored for user: %s', email);

  return {
    message: 'OTP sent successfully (simulated).',
    otp // ⚠️ only for simulation/demo
  };
}

// =======================
// Verify Aadhaar OTP
// =======================
async function verifyAadhaarOtp(email, otp) {
  logger.info('Verify Aadhaar OTP attempt for email: %s', email);

  const user = await UserModel.findUserByEmail(email);
  if (!user || !user.otpCode || !user.otpExpiresAt) {
    logger.warn('OTP verification failed: User or OTP not found - %s', email);
    throw new NotFoundError('User or OTP not found.');
  }

  if (user.otpCode !== otp || user.otpExpiresAt < new Date()) {
    logger.warn('OTP verification failed: Invalid or expired OTP for user - %s', email);
    throw new BadRequestError('Invalid or expired OTP.');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      aadhaarVerified: true,
      verificationStatus: 'VERIFIED',
      otpCode: null,
      otpExpiresAt: null
    }
  });

  logger.info('Aadhaar verified successfully for user: %s', email);

  return {
    message: 'Aadhaar verified successfully.'
  };
}

// =======================
// Get User Profile (/me)
// =======================
async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new NotFoundError('User not found.');
  return user;
}
// =======================
// Update User Profile (/update)
// =======================
async function updateProfile(userId, updates) {
  logger.info('Update profile attempt for userId: %s', userId);

  // Optional: restrict updates to specific fields
  const allowedFields = [
    'name',
    'phone',
    'dob',
    'gender',
    'address',
    'state',
    'city',
    'postalCode',
    'annualIncome',
    'employmentType',
    'employerName'
  ];

  const filteredUpdates = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    logger.warn('Update profile failed: No valid fields provided for userId: %s', userId);
    throw new BadRequestError('No valid fields provided for update.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: filteredUpdates
  });

  logger.info('Profile updated successfully for userId: %s', userId);

  return updatedUser;
}

module.exports = {
  registerUser,
  loginUser,
  requestAadhaarOtp,
  verifyAadhaarOtp,
  getProfile,
  updateProfile
};
