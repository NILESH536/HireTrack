const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  assessmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'assessment_id',
  },
  type: {
    type: DataTypes.ENUM('MCQ', 'CODING', 'SQL', 'DEBUGGING'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  marks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 10,
  },
  mcqOptions: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'mcq_options',
  },
  correctAnswer: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'correct_answer',
  },
  testCases: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'test_cases',
  },
});

module.exports = Question;
