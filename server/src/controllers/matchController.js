const { asyncHandler } = require('../utils/helpers');
const { Student, Drive } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');
const hiringIntelligenceService = require('../modules/hiring-intelligence');
const { ROLES } = require('../utils/constants');

exports.getStudentDriveMatch = asyncHandler(async (req, res) => {
  const { driveId } = req.params;
  
  // Find student profile for current user
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) {
    throw new NotFoundError('Student profile not found');
  }

  // Find Drive
  const drive = await Drive.findByPk(driveId);
  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  const matchResult = await hiringIntelligenceService.matchJob(student, drive);

  return responseBuilder.success(res, matchResult, 'Job match analysis generated successfully');
});

exports.getAdminCompanyDriveMatch = asyncHandler(async (req, res) => {
  const { driveId, studentId } = req.params;

  // Authorization is handled by route middleware (roleCheck) 
  // but let's just make sure
  if (req.user.role === ROLES.STUDENT) {
    throw new ForbiddenError('Students cannot view other students matches');
  }

  const student = await Student.findByPk(studentId);
  if (!student) {
    throw new NotFoundError('Student profile not found');
  }

  const drive = await Drive.findByPk(driveId);
  if (!drive) {
    throw new NotFoundError('Drive not found');
  }

  const matchResult = await hiringIntelligenceService.matchJob(student, drive);

  return responseBuilder.success(res, matchResult, 'Job match analysis fetched successfully');
});

exports.analyzeJD = asyncHandler(async (req, res) => {
  const { driveId, jobDescription } = req.body;
  
  if (!driveId && !jobDescription) {
    throw new Error('Must provide either driveId or custom jobDescription.');
  }

  // Get student ID. If student makes request, it's their ID. If admin makes request, they must provide studentId.
  let targetStudentId = null;
  if (req.user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) throw new NotFoundError('Student profile not found');
    targetStudentId = student.id;
  } else {
    // Admin/Company requesting
    targetStudentId = req.body.studentId;
    if (!targetStudentId) throw new Error('Admin/Company must provide studentId in body.');
  }

  const { Resume } = require('../models');
  const primaryResume = await Resume.findOne({ where: { studentId: targetStudentId, isPrimary: true } });
  if (!primaryResume) {
    throw new Error('Student does not have a primary resume uploaded.');
  }

  const analysis = await hiringIntelligenceService.resumeJdEngineService.analyzeJD(
    targetStudentId,
    primaryResume.id,
    jobDescription,
    driveId
  );

  return responseBuilder.success(res, analysis, 'Deep Resume-JD analysis completed successfully');
});
