const NotificationProviderInterface = require('./NotificationProviderInterface');
const logger = require('../../../utils/logger');

class EmailProvider extends NotificationProviderInterface {
  async send(payload) {
    // In a production environment, this would integrate with SendGrid or AWS SES
    // For Epic 11, we will simulate this by logging the email template to the console.
    
    // NOTE: In a real flow we would resolve payload.userId to their email address here.
    
    logger.info(`[EMAIL PROVIDER MOCK] Sending email to User ${payload.userId}`);
    logger.info(`Subject: ${payload.title || 'HireTrack Update'}`);
    logger.info(`Body: ${payload.message}`);
    if (payload.actionUrl) {
      logger.info(`Link: ${payload.actionUrl}`);
    }
    logger.info(`--------------------------------------------------`);
  }
}

module.exports = new EmailProvider();
