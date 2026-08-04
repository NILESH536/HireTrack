const { VerificationRequest, Company, Student, Document } = require('../../../models');
const AuditService = require('./AuditService');
const { sequelize } = require('../../../config/database');

class VerificationService {
  async submitRequest(entityType, entityId, comments = null) {
    const request = await VerificationRequest.create({
      entityType,
      entityId,
      status: 'PENDING',
      comments
    });
    
    AuditService.logEvent(entityId, 'VERIFICATION_REQUESTED', entityType, request.id);
    return request;
  }

  async processRequest(requestId, status, comments, adminId) {
    const request = await VerificationRequest.findByPk(requestId);
    if (!request) throw new Error('Request not found');

    const transaction = await sequelize.transaction();
    try {
      request.status = status;
      request.comments = comments;
      request.verifiedBy = adminId;
      await request.save({ transaction });

      // If approved, update the underlying entity
      if (status === 'APPROVED') {
        if (request.entityType === 'COMPANY') {
          await Company.update({ isVerified: true, approvalStatus: 'APPROVED' }, { where: { id: request.entityId }, transaction });
        } else if (request.entityType === 'STUDENT') {
          await Student.update({ isVerified: true, verifiedAt: new Date() }, { where: { id: request.entityId }, transaction });
        } else if (request.entityType === 'DOCUMENT') {
          await Document.update({ verificationStatus: 'VERIFIED', verifiedBy: adminId }, { where: { id: request.entityId }, transaction });
        }
      } else if (status === 'REJECTED') {
        if (request.entityType === 'COMPANY') {
          await Company.update({ approvalStatus: 'REJECTED' }, { where: { id: request.entityId }, transaction });
        } else if (request.entityType === 'DOCUMENT') {
          await Document.update({ verificationStatus: 'REJECTED', verifiedBy: adminId }, { where: { id: request.entityId }, transaction });
        }
      }

      await transaction.commit();
      AuditService.logEvent(adminId, `VERIFICATION_${status}`, request.entityType, request.entityId, { comments });
      
      return request;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPendingRequests() {
    return await VerificationRequest.findAll({
      where: { status: 'PENDING' },
      order: [['createdAt', 'ASC']]
    });
  }
}

module.exports = new VerificationService();
