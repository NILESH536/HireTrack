const { asyncHandler } = require('../utils/helpers');
const { Company, Student, Drive } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');
const AssessmentService = require('../modules/assessment/services/AssessmentService');

const assessmentService = new AssessmentService();

// ──────────── Company ────────────

exports.createAssessment = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) throw new NotFoundError('Company not found');

  const assessment = await assessmentService.createAssessment(company.id, req.body);
  return responseBuilder.success(res, assessment, 'Assessment created successfully', 201);
});

exports.addQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const questions = await assessmentService.addQuestions(id, req.body.questions);
  return responseBuilder.success(res, questions, 'Questions added successfully', 201);
});

exports.attachToDrive = asyncHandler(async (req, res) => {
  const { id, driveId } = req.params;
  const company = await Company.findOne({ where: { userId: req.user.id } });
  if (!company) throw new NotFoundError('Company not found');

  const drive = await assessmentService.linkAssessmentToDrive(id, driveId, company.id);
  return responseBuilder.success(res, drive, 'Assessment attached to Drive successfully');
});

// ──────────── Student ────────────

exports.startAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params; // Assessment ID
  const { driveId } = req.body;
  
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student not found');

  const attempt = await assessmentService.startAttempt(student.id, id, driveId);
  return responseBuilder.success(res, attempt, 'Assessment started successfully');
});

exports.submitAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, studentAnswer } = req.body;

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student not found');

  const submission = await assessmentService.submitAnswer(attemptId, questionId, studentAnswer, student.id);
  return responseBuilder.success(res, submission, 'Answer saved successfully');
});

exports.finishAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;

  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student not found');

  const attempt = await assessmentService.finishAttempt(attemptId, student.id);
  return responseBuilder.success(res, attempt, 'Assessment submitted successfully. Evaluation is pending.');
});
