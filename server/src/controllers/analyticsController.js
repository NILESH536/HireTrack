const { asyncHandler } = require('../utils/helpers');
const { Student, Company } = require('../models');
const { NotFoundError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');

const StudentAnalyticsService = require('../modules/analytics/services/StudentAnalyticsService');
const CompanyAnalyticsService = require('../modules/analytics/services/CompanyAnalyticsService');
const AdminAnalyticsService = require('../modules/analytics/services/AdminAnalyticsService');
const PredictiveAnalyticsService = require('../modules/analytics/services/PredictiveAnalyticsService');

const studentService = new StudentAnalyticsService();
const companyService = new CompanyAnalyticsService();
const adminService = new AdminAnalyticsService();
const predictiveService = new PredictiveAnalyticsService();

exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student not found');

  const data = await studentService.getDashboardAnalytics(student.id);
  return responseBuilder.success(res, data, 'Student Analytics fetched successfully');
});

exports.getCompanyDashboard = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) throw new NotFoundError('Company not found');

  const data = await companyService.getDashboardAnalytics(company.id);
  return responseBuilder.success(res, data, 'Company Analytics fetched successfully');
});

exports.getAdminDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardAnalytics();
  return responseBuilder.success(res, data, 'Admin Analytics fetched successfully');
});

exports.getInstitutionalRisk = asyncHandler(async (req, res) => {
  const data = await predictiveService.identifyHighRiskStudents();
  return responseBuilder.success(res, data, 'Predictive Risk Analytics fetched successfully');
});
