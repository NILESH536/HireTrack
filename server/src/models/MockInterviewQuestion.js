const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MockInterviewQuestion = sequelize.define('MockInterviewQuestion', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userAnswer: {
    type: DataTypes.TEXT,
    allowNull: true, // Filled in when student answers
    field: 'user_answer',
  },
  aiFeedback: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'ai_feedback',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_index',
  },
}, { tableName: 'mock_interview_questions', underscored: true });

module.exports = MockInterviewQuestion;
