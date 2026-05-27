const { Notification } = require('../models');
const { asyncHandler } = require('../utils/helpers');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  const unreadCount = await Notification.count({ where: { userId: req.user.id, read: false } });
  res.json({ notifications, unreadCount });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Notification.update({ read: true }, { where: { id, userId: req.user.id } });
  res.json({ message: 'Notification marked as read' });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
  res.json({ message: 'All notifications marked as read' });
});
