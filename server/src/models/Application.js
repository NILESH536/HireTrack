const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
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
  driveId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'drive_id',
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at',
  },
  cvScreening: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'cv_screening',
  },
  aptitudeTest: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'aptitude_test',
  },
  technicalRound1: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'technical_round_1',
  },
  technicalRound2: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'technical_round_2',
  },
  hrRound: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    field: 'hr_round',
  },
  finalResult: {
    type: DataTypes.ENUM('IN_PROGRESS', 'SELECTED', 'REJECTED', 'ON_HOLD'),
    defaultValue: 'IN_PROGRESS',
    field: 'final_result',
  },
  currentStageId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'current_stage_id',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
}, { tableName: 'applications', underscored: true });

module.exports = Application;
