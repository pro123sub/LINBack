const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mockTwilio = require('./mockTwilio');
const logger = require('../utils/logger');

// Optional: suppress logger output during tests
jest.mock('../utils/logger');

beforeAll(async () => {
  // Connect to the database
  await prisma.$connect();
  logger.info('🟢 Test DB connected');

  // Mock Twilio OTP module globally
  jest.mock('../utils/twilioOtp', () => mockTwilio);
  logger.info('🟢 Twilio OTP module mocked');

  // Clear test data if necessary
  await prisma.user.deleteMany({
    where: {
      phone: { startsWith: '+91' }, // only clear test phone numbers
    },
  });
  logger.info('🧹 Test users cleared before tests');
});

// Optional: run before each test if needed
beforeEach(async () => {
  // Could reset mocks here
  jest.clearAllMocks();
});
