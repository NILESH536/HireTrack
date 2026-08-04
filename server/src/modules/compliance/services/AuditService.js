const { AuditLog } = require('../../../models');
const logger = require('../../../utils/logger');

class AuditService {
  /**
   * Fire-and-forget log function to avoid blocking the main thread.
   */
  logEvent(actorId, actionType, entityType = null, entityId = null, metadata = {}, req = null) {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.connection?.remoteAddress;
      userAgent = req.get('user-agent');
    }

    AuditLog.create({
      actorId,
      actionType,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent
    }).catch(error => {
      logger.error('Failed to write Audit Log:', error.message);
    });
  }

  async getLogs(filters = {}, limit = 100, offset = 0) {
    return await AuditLog.findAndCountAll({
      where: filters,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }
}

module.exports = new AuditService(); // Exporting as a singleton
