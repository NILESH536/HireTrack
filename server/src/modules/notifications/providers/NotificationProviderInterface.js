class NotificationProviderInterface {
  /**
   * @param {Object} payload 
   * @param {string} payload.userId - The target user ID
   * @param {string} payload.title - Short title of the notification
   * @param {string} payload.message - Detailed message
   * @param {string} payload.type - 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
   * @param {string} payload.priority - 'LOW', 'MEDIUM', 'HIGH'
   * @param {string} payload.actionUrl - Deep link URL
   */
  async send(payload) {
    throw new Error('Not implemented');
  }
}

module.exports = NotificationProviderInterface;
