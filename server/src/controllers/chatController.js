const { ChatMessage, Student, User, Application } = require('../models');
const geminiService = require('../services/geminiService');
const { asyncHandler } = require('../utils/helpers');

exports.sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const student = await Student.findOne({
    where: { userId: req.user.id },
    include: [{ model: User, as: 'user' }],
  });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  // Save user message
  await ChatMessage.create({ studentId: student.id, sender: 'user', message });

  // Build student context
  const applications = await Application.findAll({ where: { studentId: student.id } });
  const shortlistedCount = applications.reduce((acc, app) => {
    return acc + [app.cvScreening, app.aptitudeTest, app.technicalRound1, app.technicalRound2, app.hrRound]
      .filter(r => r === true).length;
  }, 0);

  // Find most frequent rejection stage
  const rejectionStages = {};
  applications.forEach(app => {
    const rounds = ['cvScreening', 'aptitudeTest', 'technicalRound1', 'technicalRound2', 'hrRound'];
    for (const round of rounds) {
      if (app[round] === false) {
        rejectionStages[round] = (rejectionStages[round] || 0) + 1;
        break;
      }
    }
  });
  const frequentRejectionStage = Object.keys(rejectionStages).length > 0
    ? Object.entries(rejectionStages).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const context = {
    name: student.user.name,
    branch: student.branch,
    cgpa: student.cgpa,
    skills: student.skills,
    careerGoal: student.careerGoal,
    placed: student.placed,
    applicationCount: applications.length,
    shortlistedCount,
    frequentRejectionStage,
  };

  // Get recent history for multi-turn
  const history = await ChatMessage.findAll({
    where: { studentId: student.id },
    order: [['createdAt', 'ASC']],
    limit: 20,
  });

  const reply = await geminiService.getCareerAdvice(context, message, history);

  // Save bot response
  await ChatMessage.create({ studentId: student.id, sender: 'bot', message: reply });

  res.json({ reply });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  const messages = await ChatMessage.findAll({
    where: { studentId: student.id },
    order: [['createdAt', 'ASC']],
  });

  res.json(messages);
});

exports.clearHistory = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  await ChatMessage.destroy({ where: { studentId: student.id } });
  res.json({ message: 'Chat history cleared' });
});
