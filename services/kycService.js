// services/kycService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { BadRequestError } = require('../GlobalExceptionHandler/exception');

const EmploymentModel = require('../models/employmentModel');
const LoanModel = require('../models/loanModel');
const AddressModel = require('../models/adressModel');
const UserModel = require('../models/userModel');

async function saveFullKYC(userId, data) {
  if (!userId) throw new BadRequestError('User ID is required ❌');

  // Increase transaction timeout to 30s to avoid "transaction already closed" errors
  return await prisma.$transaction(
    async (tx) => {

      // ---------- Employment ----------
      if (!data.companyName || !data.companyAddress || !data.monthlyIncome || !data.stability) {
        throw new BadRequestError('Employment data incomplete ❌');
      }

      const monthlyIncome = Number(data.monthlyIncome);
      if (isNaN(monthlyIncome) || monthlyIncome < 0) {
        throw new BadRequestError('Invalid monthly income ❌');
      }

      const employmentPayload = {
        employmentType: data.employmentType || 'OTHER',
        employerName: data.companyName,
        companyAddress: data.companyAddress,
        monthlyIncome,
        stability: String(data.stability).toUpperCase()
      };

      let employment = await EmploymentModel.findByUserId(userId, tx);
      employment = employment
        ? await EmploymentModel.updateEmploymentDetails(userId, employmentPayload, tx)
        : await EmploymentModel.createEmploymentDetails(userId, employmentPayload, tx);

      logger.info('✅ Employment saved userId=%s employmentId=%s', userId, employment.id);

      // ---------- Address ----------
      if (!data.currentAddress || !data.currentAddressType || !data.permanentAddress) {
        throw new BadRequestError('Address data incomplete ❌');
      }

      const addrPayload = {
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        city: data.currentCity || null,
        state: data.currentState || null,
        postalCode: data.currentPostalCode || null,
        currentAddressType: data.currentAddressType.toUpperCase()
      };

      let addressDetail = await AddressModel.findByUserId(userId, tx);
      addressDetail = addressDetail
        ? await AddressModel.updateAddress(userId, addrPayload, tx)
        : await AddressModel.createAddress(userId, addrPayload, tx);

      logger.info('✅ Address saved userId=%s addressDetailId=%s', userId, addressDetail.id);

      // ---------- Loan ----------
      if (!data.loanAmount || !data.purpose) {
        throw new BadRequestError('Loan data incomplete ❌');
      }

      const loanAmount = Number(data.loanAmount);
      if (isNaN(loanAmount) || loanAmount <= 0) {
        throw new BadRequestError('Invalid loan amount ❌');
      }

      const loanPayload = {
        loanAmount,
        purposeOfLoan: data.purpose,
        status: data.status || 'PENDING',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        interestRate: Number(data.interestRate) || 0,
        termMonths: Number(data.termMonths) || null
      };

      const loan = await LoanModel.createLoan(userId, loanPayload, tx);
      logger.info('✅ Loan saved userId=%s loanId=%s', userId, loan.id);

      // ---------- Return ----------
      const updatedUser = await UserModel.findUserById(userId, tx);

      return { user: updatedUser, employment, addressDetail, loan };
    },
    { timeout: 50000 } // 30 seconds timeout
  );
}

module.exports = { saveFullKYC };
