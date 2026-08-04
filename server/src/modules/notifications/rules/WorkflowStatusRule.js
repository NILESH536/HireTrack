const NotificationService = require('../services/NotificationService');
const logger = require('../../../utils/logger');

class WorkflowStatusRule {
  /**
   * Evaluates the event payload and conditionally sends a notification.
   */
  async execute(payload) {
    const { studentId, stageName, stageType, companyName, applicationId } = payload;
    
    if (!studentId || !stageName || !companyName) {
      logger.error('WorkflowStatusRule missing required payload fields');
      return;
    }

    let title = 'Application Update';
    let message = `Your application at ${companyName} has been moved to: ${stageName}.`;
    let type = 'INFO';
    let priority = 'LOW';

    if (stageType === 'INTERVIEW') {
      title = 'Interview Scheduled!';
      message = `Congratulations! You have been moved to the Interview stage (${stageName}) at ${companyName}.`;
      type = 'SUCCESS';
      priority = 'HIGH';
    } else if (stageType === 'OFFER') {
      title = 'Job Offer Released!';
      message = `Incredible news! ${companyName} has moved you to the Offer stage.`;
      type = 'SUCCESS';
      priority = 'HIGH';
    } else if (stageType === 'ASSESSMENT') {
      title = 'Coding Assessment Assigned';
      message = `${companyName} has requested that you complete a coding assessment as part of the ${stageName} stage.`;
      type = 'WARNING';
      priority = 'MEDIUM';
    }

    await NotificationService.broadcast({
      userId: studentId,
      title,
      message,
      type,
      priority,
      actionUrl: `/dashboard/applications/${applicationId}`
    });
  }
}

module.exports = new WorkflowStatusRule();
