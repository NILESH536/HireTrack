const { MockInterviewAttempt, MockInterviewQuestion, Student, Resume } = require('../../../models');
const HiringIntelligenceService = require('../../hiring-intelligence');

class InterviewCoachService {
  async startInterview(studentId, interviewType, jobRole) {
    const student = await Student.findByPk(studentId);
    if (!student) throw new Error('Student not found');
    
    const primaryResume = await Resume.findOne({ where: { studentId, isPrimary: true } });
    const resumeText = primaryResume?.rawText || student.resumeText || '';

    // Generate questions using AI
    const questionsPayload = await HiringIntelligenceService.provider.generateMockQuestions(
      interviewType, 
      jobRole, 
      resumeText, 
      15 // Generate 15 level-wise questions
    );

    // Persist attempt
    const attempt = await MockInterviewAttempt.create({
      studentId,
      interviewType,
      jobRole,
      status: 'IN_PROGRESS'
    });

    // Save questions
    const questionRecords = questionsPayload.map((q, index) => ({
      attemptId: attempt.id,
      question: q.question,
      orderIndex: index
    }));
    await MockInterviewQuestion.bulkCreate(questionRecords);

    return await MockInterviewAttempt.findByPk(attempt.id, {
      include: [{ model: MockInterviewQuestion, as: 'questions', attributes: ['id', 'question', 'orderIndex'] }]
    });
  }

  async submitAnswer(attemptId, questionId, studentId, answerText) {
    const question = await MockInterviewQuestion.findOne({ where: { id: questionId, attemptId } });
    if (!question) throw new Error('Question not found');

    const evaluation = await HiringIntelligenceService.provider.evaluateInterviewAnswer(question.question, answerText);
    
    question.userAnswer = answerText;
    question.aiFeedback = evaluation;
    question.score = evaluation.score;
    await question.save();

    return question;
  }

  async completeInterview(attemptId) {
    const attempt = await MockInterviewAttempt.findByPk(attemptId, {
      include: [{ model: MockInterviewQuestion, as: 'questions' }]
    });

    if (!attempt) throw new Error('Attempt not found');

    const totalScore = attempt.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const maxScore = attempt.questions.length * 10;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    // Format transcript for ChatGPT verdict
    const transcript = attempt.questions.map(q => ({
      question: q.question,
      answer: q.userAnswer || '[No Answer]',
      score: q.score,
      feedback: q.aiFeedback?.feedback
    }));

    // Get comprehensive verdict from ChatGPT
    const aiVerdict = await HiringIntelligenceService.provider.generateInterviewVerdict(transcript);

    // Merge verdict with strengths and weaknesses
    const feedback = {
      verdict: aiVerdict.verdict,
      hireDecision: aiVerdict.hireDecision,
      strengths: aiVerdict.strengths || attempt.questions.filter(q => q.score >= 7).map(q => q.aiFeedback?.feedback),
      weaknesses: aiVerdict.weaknesses || attempt.questions.filter(q => q.score <= 7).map(q => q.aiFeedback?.improvement),
    };

    attempt.overallScore = overallScore;
    attempt.feedback = feedback;
    attempt.status = 'COMPLETED';
    await attempt.save();

    return attempt;
  }
}

module.exports = new InterviewCoachService();
