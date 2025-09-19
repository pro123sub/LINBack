// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../GlobalExceptionHandler/exception');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or malformed.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    // ✅ Safer option: attach only minimal info
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token.'));
    }
    next(error);
  }
};

module.exports = {
  authenticate
};
