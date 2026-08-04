const NotificationService = require('../modules/notifications/services/NotificationService');
const { Notification } = require('../models');
const { asyncHandler } = require('../utils/helpers');
const responseBuilder = require('../utils/responseBuilder');

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationService.getUserNotifications(req.user.id);
  const unreadCount = await Notification.count({ where: { userId: req.user.id, read: false } });
  
  return responseBuilder.success(res, { notifications, unreadCount }, 'Notifications fetched successfully');
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notif = await NotificationService.markAsRead(id, req.user.id);
  return responseBuilder.success(res, notif, 'Notification marked as read');
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.user.id);
  return responseBuilder.success(res, null, 'All notifications marked as read');
});
