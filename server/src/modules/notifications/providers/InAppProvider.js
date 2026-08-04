const NotificationProviderInterface = require('./NotificationProviderInterface');
const { Notification } = require('../../../models');
const logger = require('../../../utils/logger');

class InAppProvider extends NotificationProviderInterface {
  async send(payload) {
    try {
      await Notification.create({
        userId: payload.userId,
        title: payload.title || 'Notification', // Fallback for title if model doesn't have it explicitly
        message: payload.message,
        type: payload.type || 'INFO',
        priority: payload.priority || 'LOW',
        actionUrl: payload.actionUrl || null
      });
      // A real system might also emit a websocket event here to push to the client instantly
    } catch (error) {
      logger.error('Failed to send InApp Notification', error);
    }
  }
}

module.exports = new InAppProvider();
