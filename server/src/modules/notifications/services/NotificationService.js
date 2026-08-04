const InAppProvider = require('../providers/InAppProvider');
const EmailProvider = require('../providers/EmailProvider');
const { Notification } = require('../../../models');

class NotificationService {
  constructor() {
    this.providers = [InAppProvider, EmailProvider];
  }

  /**
   * Broadcasts a notification payload across all active providers.
   */
  async broadcast(payload) {
    const promises = this.providers.map(provider => provider.send(payload));
    await Promise.allSettled(promises);
  }

  /**
   * Used by controllers to fetch history for a user
   */
  async getUserNotifications(userId, limit = 50) {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  async markAsRead(notificationId, userId) {
    const notif = await Notification.findOne({ where: { id: notificationId, userId } });
    if (!notif) throw new Error('Notification not found');
    notif.read = true;
    await notif.save();
    return notif;
  }

  async markAllAsRead(userId) {
    await Notification.update({ read: true }, { where: { userId, read: false } });
    return true;
  }
}

module.exports = new NotificationService();
