const { Student, User, Application, Drive, Company, InterviewSlot, Notification } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, createError } = require('../utils/helpers');
const resumeParser = require('../services/resumeParser');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

// ──────────── Dashboard ────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });

  if (!student) {
    return res.status(404).json({ message: 'Student profile not found' });
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

  res.json({
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
  });
});

// ──────────── Eligible Drives ────────────
exports.getEligibleDrives = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  // If student is already placed, return empty
  if (student.placed) {
    return res.json({ drives: [], message: 'You are already placed!' });
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

  res.json({ drives: drivesWithStatus });
});

// ──────────── Apply to Drive ────────────
exports.applyToDrive = asyncHandler(async (req, res) => {
  const { driveId } = req.params;
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  if (student.placed) {
    return res.status(400).json({ message: 'You are already placed and cannot apply to new drives' });
  }

  const drive = await Drive.findByPk(driveId);
  if (!drive || !drive.active) {
    return res.status(404).json({ message: 'Drive not found or inactive' });
  }

  if (new Date() > new Date(drive.applicationDeadline)) {
    return res.status(400).json({ message: 'Application deadline has passed' });
  }

  if (student.cgpa < drive.minCgpa) {
    return res.status(400).json({ message: 'CGPA does not meet minimum requirement' });
  }

  if (!drive.eligibleBranches.includes(student.branch)) {
    return res.status(400).json({ message: 'Your branch is not eligible for this drive' });
  }

  // Check duplicate application
  const existing = await Application.findOne({
    where: { studentId: student.id, driveId },
  });
  if (existing) {
    return res.status(400).json({ message: 'You have already applied to this drive' });
  }

  const application = await Application.create({
    studentId: student.id,
    driveId,
  });

  logger.info(`Student ${student.id} applied to drive ${driveId}`);

  res.status(201).json({ message: 'Application submitted successfully', application });
});

// ──────────── Get Applications ────────────
exports.getApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

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

  res.json({ applications });
});

// ──────────── Resume Upload ────────────
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  // Extract text from resume
  const resumeText = await resumeParser.extractText(req.file.path);
  const extractedSkills = resumeParser.extractSkills(resumeText);

  // Update student profile
  await student.update({
    resumePath: req.file.path,
    resumeText,
    skills: [...new Set([...(student.skills || []), ...extractedSkills])],
  });

  res.json({
    message: 'Resume uploaded and parsed successfully',
    extractedSkills,
    resumePath: req.file.filename,
  });
});

// ──────────── Analyze Resume Fit ────────────
exports.analyzeResumeFit = asyncHandler(async (req, res) => {
  const { driveId } = req.body;
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  if (!student.resumeText) {
    return res.status(400).json({ message: 'Please upload your resume first' });
  }

  const drive = await Drive.findByPk(driveId);
  if (!drive) return res.status(404).json({ message: 'Drive not found' });

  const analysis = await geminiService.analyzeResumeFit(student.resumeText, drive.jobDescription);

  res.json({ analysis });
});

// ──────────── Profile ────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  res.json({ student });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { branch, cgpa, skills, careerGoal, name } = req.body;

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  if (branch) student.branch = branch;
  if (cgpa !== undefined) student.cgpa = cgpa;
  if (skills) student.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
  if (careerGoal) student.careerGoal = careerGoal;
  await student.save();

  // Update user name if provided
  if (name) {
    await User.update({ name }, { where: { id: req.user.id } });
  }

  res.json({ message: 'Profile updated successfully', student });
});

// ──────────── Interviews ────────────
exports.getInterviews = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

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

  res.json({ upcoming, past });
});
