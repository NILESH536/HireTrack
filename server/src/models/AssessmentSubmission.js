const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssessmentSubmission = sequelize.define('AssessmentSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  attemptId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'attempt_id',
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'question_id',
  },
  studentAnswer: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'student_answer',
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'is_correct',
  },
  score: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  evaluationFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'evaluation_feedback',
  }
});

module.exports = AssessmentSubmission;
