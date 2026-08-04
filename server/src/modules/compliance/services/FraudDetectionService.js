const { Application, Company } = require('../../../models');
const AuditService = require('./AuditService');
const { Op } = require('sequelize');

class FraudDetectionService {
  
  async checkDuplicateApplication(studentId, driveId) {
    const existing = await Application.findOne({
      where: { studentId, driveId }
    });

    if (existing) {
      AuditService.logEvent(studentId, 'FRAUD_ALERT_DUPLICATE_APP', 'Drive', driveId);
      throw new Error('Duplicate application detected.');
    }
    return true;
  }

  async validateCompanyEmail(companyName, email, userId) {
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];

    if (publicDomains.includes(domain)) {
      AuditService.logEvent(userId, 'FRAUD_ALERT_PUBLIC_EMAIL', 'Company', null, { email, companyName });
      return { isValid: false, warning: 'Public email domains are heavily restricted for recruiter accounts.' };
    }

    // Check if another company already uses this domain
    const existingCompany = await Company.findOne({
      where: {
        website: { [Op.like]: `%${domain}%` }
      }
    });

    if (existingCompany && existingCompany.name.toLowerCase() !== companyName.toLowerCase()) {
      AuditService.logEvent(userId, 'FRAUD_ALERT_DOMAIN_MISMATCH', 'Company', existingCompany.id, { email, companyName });
      return { isValid: false, warning: 'Domain belongs to another registered company.' };
    }

    return { isValid: true };
  }
}

module.exports = new FraudDetectionService();
