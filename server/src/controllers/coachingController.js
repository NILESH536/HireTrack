const { asyncHandler } = require('../utils/helpers');
const { Student } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const responseBuilder = require('../utils/responseBuilder');

const InterviewCoachService = require('../modules/coaching/services/InterviewCoachService');
const LearningEngineService = require('../modules/coaching/services/LearningEngineService');

// ──────────── Mock Interview ────────────

exports.startMockInterview = asyncHandler(async (req, res) => {
  const { interviewType, jobRole } = req.body;
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const attempt = await InterviewCoachService.startInterview(student.id, interviewType, jobRole);
  return responseBuilder.success(res, attempt, 'Mock interview started successfully', 201);
});

exports.submitAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, answerText } = req.body;
  const student = await Student.findOne({ where: { userId: req.user.id } });

  const question = await InterviewCoachService.submitAnswer(attemptId, questionId, student.id, answerText);
  return responseBuilder.success(res, question, 'Answer evaluated successfully');
});

exports.completeInterview = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  
  const attempt = await InterviewCoachService.completeInterview(attemptId);
  return responseBuilder.success(res, attempt, 'Mock interview completed');
});

// ──────────── Personalized Learning ────────────

exports.getLearningRoadmap = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) throw new NotFoundError('Student profile not found');

  const roadmap = await LearningEngineService.getOrGenerateRoadmap(student.id);
  return responseBuilder.success(res, roadmap, 'Learning roadmap fetched successfully');
});
