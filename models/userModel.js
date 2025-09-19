const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserModel {
  static async createUser(data) {
    return prisma.user.create({ data });
  }

  static async findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  // Add more helper methods as needed
}

module.exports = UserModel;
