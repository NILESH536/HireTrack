const { User, Company, Student, Drive, Application, Notification } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { asyncHandler } = require('../utils/helpers');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const responseBuilder = require('../utils/responseBuilder');
const { NotFoundError, BadRequestError } = require('../utils/errors');

exports.getDashboard = asyncHandler(async (req, res) => {
  const totalStudents = await Student.count();
  const totalCompanies = await Company.count();
  const totalDrives = await Drive.count();
  const placedStudents = await Student.count({ where: { placed: true } });
  const activeDrives = await Drive.count({ where: { active: true } });
  const pendingCompanies = await User.count({ where: { role: 'COMPANY', approved: false } });

  // Recent activity
  const recentApplications = await Application.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
      { model: Drive, as: 'drive', include: [{ model: Company, as: 'company', include: [{ model: User, as: 'user', attributes: ['name'] }] }] },
    ],
  });

  // Branch-wise placement
  const branchStats = await Student.findAll({
    attributes: ['branch',
      [sequelize.fn('COUNT', sequelize.col('Student.id')), 'total'],
      [sequelize.fn('SUM', sequelize.cast(sequelize.col('placed'), 'integer')), 'placed'],
    ],
    group: ['branch'],
    raw: true,
  });

  // Top hiring companies
  const topCompanies = await Application.findAll({
    where: { finalResult: 'SELECTED' },
    attributes: [[sequelize.fn('COUNT', sequelize.col('Application.id')), 'hires']],
    include: [{
      model: Drive, as: 'drive', attributes: [],
      include: [{ model: Company, as: 'company', attributes: ['id'], include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    }],
    group: ['drive.company.id', 'drive.company.user.id', 'drive.company.user.name', 'drive.id', 'drive.company_id'],
    order: [[sequelize.fn('COUNT', sequelize.col('Application.id')), 'DESC']],
    limit: 5,
    raw: false,
  });

  const data = {
    stats: { totalStudents, totalCompanies, totalDrives, placedStudents, activeDrives, pendingCompanies },
    branchStats,
    recentActivity: recentApplications,
  };

  return responseBuilder.success(res, data, 'Admin dashboard fetched successfully');
});

exports.getPendingCompanies = asyncHandler(async (req, res) => {
  const pending = await User.findAll({
    where: { role: 'COMPANY', approved: false },
    include: [{ model: Company, as: 'company' }],
    order: [['createdAt', 'DESC']],
  });
  return responseBuilder.success(res, { companies: pending }, 'Pending companies fetched successfully');
});

exports.approveCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user || user.role !== 'COMPANY') throw new NotFoundError('Company not found');

  user.approved = true;
  await user.save();

  await Notification.create({ userId: id, message: 'Your company has been approved! You can now post drives.', type: 'COMPANY_APPROVED' });
  emailService.sendCompanyApproved(user);

  logger.info(`Company approved: ${user.email}`);
  return responseBuilder.success(res, null, 'Company approved successfully');
});

exports.rejectCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) throw new BadRequestError('Rejection reason is required');

  const user = await User.findByPk(id, { include: [{ model: Company, as: 'company' }] });
  if (!user || user.role !== 'COMPANY') throw new NotFoundError('Company not found');

  if (user.company) {
    user.company.rejectionReason = reason;
    await user.company.save();
  }

  await Notification.create({ userId: id, message: `Registration rejected. Reason: ${reason}`, type: 'COMPANY_REJECTED' });
  emailService.sendCompanyRejected(user, reason);

  logger.info(`Company rejected: ${user.email}`);
  return responseBuilder.success(res, null, 'Company rejected');
});

exports.getStatistics = asyncHandler(async (req, res) => {
  const totalStudents = await Student.count();
  const placedStudents = await Student.count({ where: { placed: true } });
  const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

  const branchStats = await Student.findAll({
    attributes: ['branch',
      [sequelize.fn('COUNT', sequelize.col('Student.id')), 'total'],
      [sequelize.fn('SUM', sequelize.cast(sequelize.col('placed'), 'integer')), 'placed'],
    ],
    group: ['branch'],
    raw: true,
  });

  // Monthly drive activity
  const monthlyDrives = await Drive.findAll({
    attributes: [
      [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
    raw: true,
  });

  const data = { placementRate, branchStats, monthlyDrives, totalStudents, placedStudents };
  return responseBuilder.success(res, data, 'Statistics fetched successfully');
});
