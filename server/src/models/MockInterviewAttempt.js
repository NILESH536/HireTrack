const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MockInterviewAttempt = sequelize.define('MockInterviewAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'student_id',
  },
  interviewType: {
    type: DataTypes.ENUM('HR', 'TECHNICAL', 'BEHAVIORAL', 'ROLE_SPECIFIC'),
    allowNull: false,
    field: 'interview_type',
  },
  jobRole: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'job_role',
  },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'IN_PROGRESS',
  },
  overallScore: {
    type: DataTypes.INTEGER,
    allowNull: true, // Only set when completed
    field: 'overall_score',
  },
  feedback: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
});

module.exports = MockInterviewAttempt;
