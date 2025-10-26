const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AadhaarModel = {
  async createAadhaarRecord(userId, aadhaarNumber) {
    return prisma.aadhaarVerification.create({
      data: {
        aadhaarNumber,
        userId,
      },
    });
  },

  async findByUserId(userId) {
    return prisma.aadhaarVerification.findUnique({ where: { userId } });
  },

  async verifyAadhaar(userId) {
    return prisma.aadhaarVerification.update({
      where: { userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  },
};

module.exports = AadhaarModel;
