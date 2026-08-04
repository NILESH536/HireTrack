const logger = require('../../../utils/logger');
const ProviderFactory = require('../../hiring-intelligence/providers/ProviderFactory');

class EvaluationService {
  constructor() {
    this.provider = ProviderFactory.getProvider();
  }

  async evaluateMCQ(studentAnswer, correctAnswer, marks) {
    const isCorrect = (studentAnswer || '').trim().toLowerCase() === (correctAnswer || '').trim().toLowerCase();
    return {
      isCorrect,
      score: isCorrect ? marks : 0,
      feedback: isCorrect ? 'Correct.' : 'Incorrect.'
    };
  }

  async evaluateCodeOrSQL(studentAnswer, questionType, content, marks, testCases) {
    if (!studentAnswer || studentAnswer.trim() === '') {
      return { isCorrect: false, score: 0, feedback: 'No answer provided.' };
    }

    try {
      const evaluation = await this.provider.evaluateCode(studentAnswer, questionType, content, testCases);
      // evaluation should be { isCorrect: boolean, scoreRatio: number (0-1), feedback: string }
      return {
        isCorrect: evaluation.isCorrect,
        score: Math.round(evaluation.scoreRatio * marks * 10) / 10,
        feedback: evaluation.feedback
      };
    } catch (error) {
      logger.error('AI Evaluation Failed:', error);
      return { isCorrect: false, score: 0, feedback: 'Evaluation failed due to an internal error.' };
    }
  }

  async evaluateSubmission(submission, question) {
    if (question.type === 'MCQ') {
      return this.evaluateMCQ(submission.studentAnswer, question.correctAnswer, question.marks);
    } else if (question.type === 'CODING' || question.type === 'SQL' || question.type === 'DEBUGGING') {
      return this.evaluateCodeOrSQL(submission.studentAnswer, question.type, question.content, question.marks, question.testCases);
    }
    return { isCorrect: false, score: 0, feedback: 'Unknown question type.' };
  }
}

module.exports = EvaluationService;
