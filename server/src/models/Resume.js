const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resume = sequelize.define('Resume', {
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
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'file_url',
  },
  rawText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'raw_text',
  },
  atsScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'ats_score',
  },
  structuredData: {
    type: DataTypes.JSONB,
    defaultValue: {},
    field: 'structured_data',
  },
  aiSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'ai_summary',
  },
}, { tableName: 'resumes', underscored: true });

module.exports = Resume;
