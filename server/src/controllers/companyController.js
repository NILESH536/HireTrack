const { Company, User, Drive, Application, Student, InterviewSlot, Notification } = require('../models');
const { asyncHandler } = require('../utils/helpers');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ──────────── Dashboard ────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const company = await Company.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });
  if (!company) return res.status(404).json({ message: 'Company profile not found' });

  const drives = await Drive.findAll({
    where: { companyId: company.id },
    include: [{ model: Application, as: 'applications' }],
    order: [['createdAt', 'DESC']],
  });

  const totalDrives = drives.length;
  const activeDrives = drives.filter(d => d.active).length;
  const totalApplications = drives.reduce((sum, d) => sum + d.applications.length, 0);
  const totalSelected = drives.reduce((sum, d) =>
    sum + d.applications.filter(a => a.finalResult === 'SELECTED').length, 0
  );

  res.json({
    company: company.toJSON(),
    drives: drives.map(d => ({ ...d.toJSON(), applicantCount: d.applications.length })),
    stats: { totalDrives, activeDrives, totalApplications, totalSelected },
  });
});

// ──────────── Create Drive ────────────
exports.createDrive = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) return res.status(404).json({ message: 'Company profile not found' });

  const drive = await Drive.create({ companyId: company.id, ...req.body });

  // Notify eligible students
  const eligibleStudents = await Student.findAll({
    where: { placed: false },
    include: [{ model: User, as: 'user' }],
  });

  for (const student of eligibleStudents) {
    if (student.cgpa >= drive.minCgpa && drive.eligibleBranches.includes(student.branch)) {
      await Notification.create({
        userId: student.userId,
        message: `New drive posted: ${drive.jobRole} at ${req.user.name} - ${drive.salaryLpa} LPA`,
        type: 'DRIVE_POSTED',
      });
    }
  }

  logger.info(`Drive created: ${drive.jobRole} by company ${company.id}`);
  res.status(201).json({ message: 'Drive posted successfully', drive });
});

// ──────────── Get Company Drives ────────────
exports.getDrives = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) return res.status(404).json({ message: 'Company profile not found' });

  const drives = await Drive.findAll({
    where: { companyId: company.id },
    include: [{ model: Application, as: 'applications' }],
    order: [['createdAt', 'DESC']],
  });

  res.json({ drives: drives.map(d => ({ ...d.toJSON(), applicantCount: d.applications.length })) });
});

// ──────────── Get Applicants for a Drive ────────────
exports.getApplicants = asyncHandler(async (req, res) => {
  const { driveId } = req.params;
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) return res.status(404).json({ message: 'Company profile not found' });

  const drive = await Drive.findOne({ where: { id: driveId, companyId: company.id } });
  if (!drive) return res.status(404).json({ message: 'Drive not found' });

  const applications = await Application.findAll({
    where: { driveId },
    include: [{
      model: Student, as: 'student',
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    }, {
      model: InterviewSlot, as: 'interviewSlots',
    }],
    order: [['appliedAt', 'ASC']],
  });

  res.json({ drive, applications });
});

// ──────────── Update Shortlist Status ────────────
exports.updateShortlist = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { round, status } = req.body;

  const application = await Application.findByPk(applicationId, {
    include: [
      { model: Drive, as: 'drive', include: [{ model: Company, as: 'company' }] },
      { model: Student, as: 'student' },
    ],
  });
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (application.drive.companyId !== company.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const validRounds = ['cvScreening', 'aptitudeTest', 'technicalRound1', 'technicalRound2', 'hrRound'];
  if (!validRounds.includes(round)) {
    return res.status(400).json({ message: 'Invalid round' });
  }

  application[round] = status;
  if (status === false) application.finalResult = 'REJECTED';
  await application.save();

  await Notification.create({
    userId: application.student.userId,
    message: `${round.replace(/([A-Z])/g, ' $1').trim()} result: ${status ? 'Cleared ✅' : 'Not cleared ❌'} for ${application.drive.jobRole}`,
    type: 'APPLICATION_UPDATE',
  });

  res.json({ message: 'Shortlist status updated', application });
});

// ──────────── Bulk Shortlist ────────────
exports.bulkShortlist = asyncHandler(async (req, res) => {
  const { applicationIds, round, status } = req.body;
  const company = await Company.findOne({ where: { userId: req.user.id } });
  let updated = 0;

  for (const appId of applicationIds) {
    const app = await Application.findByPk(appId, {
      include: [{ model: Drive, as: 'drive' }, { model: Student, as: 'student' }],
    });
    if (app && app.drive.companyId === company.id) {
      app[round] = status;
      if (status === false) app.finalResult = 'REJECTED';
      await app.save();
      await Notification.create({
        userId: app.student.userId,
        message: `${round.replace(/([A-Z])/g, ' $1').trim()}: ${status ? 'Cleared ✅' : 'Not cleared ❌'}`,
        type: 'APPLICATION_UPDATE',
      });
      updated++;
    }
  }

  res.json({ message: `${updated} applications updated` });
});

// ──────────── Schedule Interview ────────────
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const { applicationId, roundType, interviewDateTime, mode, venueOrLink } = req.body;

  const application = await Application.findByPk(applicationId, {
    include: [{ model: Drive, as: 'drive' }, { model: Student, as: 'student' }],
  });
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (application.drive.companyId !== company.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const slot = await InterviewSlot.create({
    applicationId, roundType, interviewDateTime, mode, venueOrLink,
  });

  await Notification.create({
    userId: application.student.userId,
    message: `Interview scheduled: ${roundType.replace(/_/g, ' ')} on ${new Date(interviewDateTime).toLocaleDateString()} (${mode})`,
    type: 'INTERVIEW_SCHEDULED',
  });

  res.status(201).json({ message: 'Interview scheduled', slot });
});

// ──────────── Set Final Result ────────────
exports.setResult = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { result } = req.body;

  const application = await Application.findByPk(applicationId, {
    include: [
      { model: Drive, as: 'drive', include: [{ model: Company, as: 'company', include: [{ model: User, as: 'user' }] }] },
      { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
    ],
  });
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (application.drive.companyId !== company.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  application.finalResult = result;
  await application.save();

  if (result === 'SELECTED') {
    await Student.update({ placed: true }, { where: { id: application.studentId } });
    await Notification.create({
      userId: application.student.userId,
      message: `🎉 Congratulations! You've been SELECTED by ${application.drive.company.user.name} for ${application.drive.jobRole}!`,
      type: 'RESULT_ANNOUNCED',
    });
    emailService.sendPlacementCongrats(
      application.student.user,
      application.drive.company.user.name,
      application.drive.jobRole
    );
  } else {
    await Notification.create({
      userId: application.student.userId,
      message: `Result for ${application.drive.jobRole}: ${result}`,
      type: 'RESULT_ANNOUNCED',
    });
  }

  logger.info(`Result set: ${result} for application ${applicationId}`);
  res.json({ message: 'Result updated', application });
});

// ──────────── Add Feedback ────────────
exports.addFeedback = asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { feedback } = req.body;

  const slot = await InterviewSlot.findByPk(slotId, {
    include: [{ model: Application, as: 'application', include: [{ model: Drive, as: 'drive' }] }],
  });
  if (!slot) return res.status(404).json({ message: 'Interview slot not found' });

  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (slot.application.drive.companyId !== company.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  slot.feedback = feedback;
  await slot.save();
  res.json({ message: 'Feedback added', slot });
});

// ──────────── Export Applicants CSV ────────────
exports.exportApplicants = asyncHandler(async (req, res) => {
  const { driveId } = req.params;
  const company = await Company.findOne({ where: { userId: req.user.id } });

  const drive = await Drive.findOne({ where: { id: driveId, companyId: company.id } });
  if (!drive) return res.status(404).json({ message: 'Drive not found' });

  const applications = await Application.findAll({
    where: { driveId },
    include: [{
      model: Student, as: 'student',
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    }],
  });

  const headers = 'Name,Email,Branch,CGPA,CV,Aptitude,Tech1,Tech2,HR,Result\n';
  const rows = applications.map(app => {
    const s = app.student;
    return `"${s.user.name}","${s.user.email}","${s.branch}",${s.cgpa},${app.cvScreening ?? 'Pending'},${app.aptitudeTest ?? 'Pending'},${app.technicalRound1 ?? 'Pending'},${app.technicalRound2 ?? 'Pending'},${app.hrRound ?? 'Pending'},${app.finalResult}`;
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="applicants-${driveId}.csv"`);
  res.send(headers + rows);
});
