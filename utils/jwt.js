const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const logger = require('./logger'); // Import the logger

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generate JWT token for a user
function generateToken(user) {
  try {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    logger.info('JWT generated for user: %s', user.email);
    return token;
  } catch (error) {
    logger.error('Error generating JWT for user: %s - %s', user.email, error.message);
    throw error;
  }
}

// Verify JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.info('JWT verified for user ID: %s', decoded.id);
    return decoded;
  } catch (error) {
    logger.error('JWT verification failed: %s', error.message);
    throw error;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
