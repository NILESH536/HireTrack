const { Student, User, Application, Drive, Company, InterviewSlot, Notification } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, createError } = require('../utils/helpers');
const resumeParser = require('../services/resumeParser');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');
const responseBuilder = require('../utils/responseBuilder');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// ──────────── Dashboard ────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });

  if (!student) {
    throw new NotFoundError('Student profile not found');
  }

  // Get applications with drives and companies
  const applications = await Application.findAll({
    where: { studentId: student.id },
    include: [{
      model: Drive,
      as: 'drive',
      include: [{ model: Company, as: 'company', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    }, {
      model: InterviewSlot,
      as: 'interviewSlots',
    }],
    order: [['appliedAt', 'DESC']],
  });

  // Get eligible drives count
  const eligibleDrivesCount = await Drive.count({
    where: {
      active: true,
      minCgpa: { [Op.lte]: student.cgpa },
      applicationDeadline: { [Op.gte]: new Date() },
    },
  });

  // Calculate stats
  const totalApplied = applications.length;
  const shortlistedCount = applications.reduce((acc, app) => {
    return acc + [app.cvScreening, app.aptitudeTest, app.technicalRound1, app.technicalRound2, app.hrRound]
      .filter(r => r === true).length;
  }, 0);
  const rejectedCount = applications.filter(app => app.finalResult === 'REJECTED').length;
  const selectedApp = applications.find(app => app.finalResult === 'SELECTED');

  // Get upcoming interviews
  const allSlots = applications.flatMap(app => 
    (app.interviewSlots || []).map(slot => ({
      ...slot.toJSON(),
      companyName: app.drive?.company?.user?.name,
      jobRole: app.drive?.jobRole,
    }))
  );

  const upcoming = allSlots
    .filter(s => new Date(s.interviewDateTime) > new Date())
    .sort((a, b) => new Date(a.interviewDateTime) - new Date(b.interviewDateTime));

  const past = allSlots
    .filter(s => new Date(s.interviewDateTime) <= new Date())
    .sort((a, b) => new Date(b.interviewDateTime) - new Date(a.interviewDateTime));

  const data = {
    student: student.toJSON(),
    applications: applications.map(app => app.toJSON()),
    stats: {
      eligibleDrives: eligibleDrivesCount,
      totalApplied,
      shortlistedCount,
      rejectedCount,
    },
    interviews: { upcoming, past },
    placedCompany: selectedApp ? selectedApp.drive?.company?.user?.name : null,
  };

  return responseBuilder.success(res, data, 'Dashboard data fetched successfully');
});

// ──────────── Eligible Drives ────────────
exports.getEligibleDrives = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  // If student is already placed, return empty
  if (student.placed) {
    return responseBuilder.success(res, { drives: [] }, 'You are already placed!');
  }

  const drives = await Drive.findAll({
    where: {
      active: true,
      minCgpa: { [Op.lte]: student.cgpa },
      applicationDeadline: { [Op.gte]: new Date() },
    },
    include: [{
      model: Company,
      as: 'company',
      include: [{ model: User, as: 'user', attributes: ['name'] }],
    }],
    order: [['applicationDeadline', 'ASC']],
  });

  // Filter by branch eligibility
  const eligibleDrives = drives.filter(drive => 
    drive.eligibleBranches.includes(student.branch)
  );

  // Get student's existing applications
  const appliedDriveIds = (await Application.findAll({
    where: { studentId: student.id },
    attributes: ['driveId'],
  })).map(a => a.driveId);

  const drivesWithStatus = eligibleDrives.map(drive => ({
    ...drive.toJSON(),
    applied: appliedDriveIds.includes(drive.id),
  }));

  return responseBuilder.success(res, { drives: drivesWithStatus }, 'Eligible drives fetched successfully');
});

// ──────────── Apply to Drive ────────────
exports.applyToDrive = asyncHandler(async (req, res) => {
  const { driveId } = req.params;
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  if (student.placed) {
    throw new BadRequestError('You are already placed and cannot apply to new drives');
  }

  const drive = await Drive.findByPk(driveId);
  if (!drive || !drive.active) {
    throw new NotFoundError('Drive not found or inactive');
  }

  if (new Date() > new Date(drive.applicationDeadline)) {
    throw new BadRequestError('Application deadline has passed');
  }

  if (student.cgpa < drive.minCgpa) {
    throw new BadRequestError('CGPA does not meet minimum requirement');
  }

  if (!drive.eligibleBranches.includes(student.branch)) {
    throw new BadRequestError('Your branch is not eligible for this drive');
  }

  // Check duplicate application
  const existing = await Application.findOne({
    where: { studentId: student.id, driveId },
  });
  if (existing) {
    throw new BadRequestError('You have already applied to this drive');
  }

  const application = await Application.create({
    studentId: student.id,
    driveId,
  });

  logger.info(`Student ${student.id} applied to drive ${driveId}`);

  return responseBuilder.success(res, { application }, 'Application submitted successfully', 201);
});

// ──────────── Get Applications ────────────
exports.getApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const applications = await Application.findAll({
    where: { studentId: student.id },
    include: [{
      model: Drive,
      as: 'drive',
      include: [{ model: Company, as: 'company', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    }, {
      model: InterviewSlot,
      as: 'interviewSlots',
      order: [['interviewDateTime', 'ASC']],
    }],
    order: [['appliedAt', 'DESC']],
  });

  return responseBuilder.success(res, { applications }, 'Applications fetched successfully');
});

// ──────────── Resume Upload ────────────
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('No resume file uploaded');
  }

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const hiringIntelligenceService = require('../modules/hiring-intelligence');
  
  // Delegate entirely to ResumeIntelligenceService
  const processedResume = await hiringIntelligenceService.resumeIntelligenceService.processAndStoreResume(
    student.id,
    req.file.filename,
    req.file.path
  );

  // Update legacy path for backwards compatibility
  await student.update({
    resumePath: req.file.filename,
    resumeText: processedResume.rawText,
  });

  return responseBuilder.success(res, {
    resumePath: processedResume.fileUrl,
    intelligence: processedResume,
  }, 'Resume uploaded and parsed successfully');
});

// ──────────── ATS Resume Analysis ────────────
exports.analyzeATS = asyncHandler(async (req, res) => {
  const { jobDescription, driveId } = req.body;
  
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  // Find the primary resume
  const { Resume, AIExplanation } = require('../models');
  const primaryResume = await Resume.findOne({
    where: { studentId: student.id, isPrimary: true },
    include: [{ model: AIExplanation, as: 'explanation' }]
  });

  if (!primaryResume) {
    throw new BadRequestError('Please upload your resume first to analyze it.');
  }

  // If a JD is provided, we need to dynamically re-analyze ATS against it
  if (jobDescription || driveId) {
    let jdToAnalyze = jobDescription;
    if (driveId && !jdToAnalyze) {
      const drive = await Drive.findByPk(driveId);
      if (drive) jdToAnalyze = drive.jobDescription;
    }
    
    const hiringIntelligenceService = require('../modules/hiring-intelligence');
    const dynamicAnalysis = await hiringIntelligenceService.resumeIntelligenceService.analyzeATSForJob(
      primaryResume.id,
      jdToAnalyze
    );
    return responseBuilder.success(res, { analysis: dynamicAnalysis }, 'ATS Analysis completed');
  }

  // If no JD, just return the cached general analysis stored in the Resume table
  return responseBuilder.success(res, {
    analysis: {
      atsScore: primaryResume.atsScore,
      ...primaryResume.structuredData,
      summary: primaryResume.aiSummary,
      explanation: primaryResume.explanation
    }
  }, 'Cached ATS Analysis fetched');
});

// ──────────── Profile ────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });
  if (!student) throw new NotFoundError('Student profile not found');

  return responseBuilder.success(res, { student }, 'Profile fetched successfully');
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { branch, cgpa, skills, careerGoal, name } = req.body;

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  if (branch) student.branch = branch;
  if (cgpa !== undefined) student.cgpa = cgpa;
  if (skills) student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (careerGoal) student.careerGoal = careerGoal;
  await student.save();

  // Update user name if provided
  if (name) {
    await User.update({ name }, { where: { id: req.user.id } });
  }

  return responseBuilder.success(res, { student }, 'Profile updated successfully');
});

// ──────────── Career Intelligence & Predictions ────────────
exports.getPlacementPrediction = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const hiringIntelligenceService = require('../modules/hiring-intelligence');
  
  // false = fetch from cache if < 7 days old
  const prediction = await hiringIntelligenceService.placementPredictionService.generatePrediction(student.id, false);

  return responseBuilder.success(res, { prediction }, 'Placement prediction fetched successfully');
});

exports.regeneratePlacementPrediction = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const hiringIntelligenceService = require('../modules/hiring-intelligence');
  
  // true = force regenerate and ignore cache
  const prediction = await hiringIntelligenceService.placementPredictionService.generatePrediction(student.id, true);

  return responseBuilder.success(res, { prediction }, 'Placement prediction regenerated successfully');
});

// ──────────── Interviews ────────────
exports.getInterviews = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const applications = await Application.findAll({
    where: { studentId: student.id },
    include: [{
      model: InterviewSlot,
      as: 'interviewSlots',
    }, {
      model: Drive,
      as: 'drive',
      include: [{ model: Company, as: 'company', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
    }],
  });

  const allSlots = applications.flatMap(app =>
    (app.interviewSlots || []).map(slot => ({
      ...slot.toJSON(),
      companyName: app.drive?.company?.user?.name,
      jobRole: app.drive?.jobRole,
    }))
  );

  const now = new Date();
  const upcoming = allSlots.filter(s => new Date(s.interviewDateTime) > now)
    .sort((a, b) => new Date(a.interviewDateTime) - new Date(b.interviewDateTime));
  const past = allSlots.filter(s => new Date(s.interviewDateTime) <= now)
    .sort((a, b) => new Date(b.interviewDateTime) - new Date(a.interviewDateTime));

  return responseBuilder.success(res, { upcoming, past }, 'Interviews fetched successfully');
});
