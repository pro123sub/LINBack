const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PanModel = {
  async createPanRecord(userId, panNumber) {
    return prisma.panVerification.create({
      data: {
        panNumber,
        userId,
      },
    });
  },

  async findByUserId(userId) {
    return prisma.panVerification.findUnique({ where: { userId } });
  },

  async verifyPan(userId) {
    return prisma.panVerification.update({
      where: { userId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });
  },
};

module.exports = PanModel;
