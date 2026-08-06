const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AssessmentAttempt = sequelize.define('AssessmentAttempt', {
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
  assessmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'assessment_id',
  },
  driveId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'drive_id',
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'start_time',
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time',
  },
  status: {
    type: DataTypes.ENUM('IN_PROGRESS', 'SUBMITTED', 'EVALUATED'),
    defaultValue: 'IN_PROGRESS',
  },
  totalScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'total_score',
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
}, { tableName: 'assessment_attempts', underscored: true });

module.exports = AssessmentAttempt;
