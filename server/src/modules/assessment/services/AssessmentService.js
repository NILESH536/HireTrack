const { Assessment, Question, AssessmentAttempt, AssessmentSubmission, Drive } = require('../../../models');
const EvaluationService = require('./EvaluationService');
const logger = require('../../../utils/logger');
const { Op } = require('sequelize');

class AssessmentService {
  constructor() {
    this.evaluationService = new EvaluationService();
  }

  // ──────────── Company Operations ────────────

  async createAssessment(companyId, data) {
    return await Assessment.create({ companyId, ...data });
  }

  async addQuestions(assessmentId, questionsData) {
    const questions = questionsData.map(q => ({ assessmentId, ...q }));
    return await Question.bulkCreate(questions);
  }

  async linkAssessmentToDrive(assessmentId, driveId, companyId) {
    const drive = await Drive.findOne({ where: { id: driveId, companyId } });
    if (!drive) throw new Error('Drive not found or unauthorized.');
    
    drive.assessmentId = assessmentId;
    await drive.save();
    return drive;
  }

  // ──────────── Student Operations ────────────

  async startAttempt(studentId, assessmentId, driveId = null) {
    const assessment = await Assessment.findByPk(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const existingAttempt = await AssessmentAttempt.findOne({ where: { studentId, assessmentId } });
    if (existingAttempt) {
      if (existingAttempt.status !== 'IN_PROGRESS') throw new Error('You have already completed this assessment.');
      return existingAttempt; // Resume
    }

    return await AssessmentAttempt.create({
      studentId,
      assessmentId,
      driveId,
      status: 'IN_PROGRESS'
    });
  }

  async submitAnswer(attemptId, questionId, studentAnswer, studentId) {
    const attempt = await AssessmentAttempt.findOne({ 
      where: { id: attemptId, studentId },
      include: [Assessment] 
    });
    
    if (!attempt) throw new Error('Attempt not found.');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Assessment is no longer active.');

    // Timer protection
    const now = new Date();
    const expiryTime = new Date(attempt.startTime.getTime() + attempt.Assessment.durationMinutes * 60000);
    // Give a 2-minute grace period
    if (now > new Date(expiryTime.getTime() + 120000)) {
      attempt.status = 'SUBMITTED';
      await attempt.save();
      throw new Error('Assessment time has expired.');
    }

    // Upsert submission
    const existing = await AssessmentSubmission.findOne({ where: { attemptId, questionId } });
    if (existing) {
      existing.studentAnswer = studentAnswer;
      await existing.save();
      return existing;
    } else {
      return await AssessmentSubmission.create({ attemptId, questionId, studentAnswer });
    }
  }

  async finishAttempt(attemptId, studentId) {
    const attempt = await AssessmentAttempt.findOne({ 
      where: { id: attemptId, studentId },
      include: [Assessment]
    });
    if (!attempt) throw new Error('Attempt not found.');
    if (attempt.status === 'EVALUATED') throw new Error('Already evaluated.');

    attempt.status = 'SUBMITTED';
    attempt.endTime = new Date();
    await attempt.save();

    // Trigger async evaluation
    this._evaluateAttemptAsync(attemptId).catch(err => {
      logger.error(`Failed to evaluate attempt ${attemptId}:`, err);
    });

    return attempt;
  }

  async _evaluateAttemptAsync(attemptId) {
    const attempt = await AssessmentAttempt.findByPk(attemptId, {
      include: [
        { model: Assessment, as: 'assessment' },
        { 
          model: AssessmentSubmission, 
          as: 'submissions',
          include: [{ model: Question, as: 'question' }]
        }
      ]
    });

    if (!attempt) return;

    let totalScore = 0;

    // Evaluate each submission
    for (const sub of attempt.submissions) {
      const evalResult = await this.evaluationService.evaluateSubmission(sub, sub.question);
      sub.isCorrect = evalResult.isCorrect;
      sub.score = evalResult.score;
      sub.evaluationFeedback = evalResult.feedback;
      await sub.save();
      totalScore += sub.score;
    }

    attempt.totalScore = totalScore;
    attempt.passed = totalScore >= attempt.assessment.passingScore;
    attempt.status = 'EVALUATED';
    await attempt.save();

    logger.info(`Attempt ${attemptId} evaluated. Score: ${totalScore}`);
  }
}

module.exports = AssessmentService;
