const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResumeJDAnalysis = sequelize.define('ResumeJDAnalysis', {
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
  resumeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'resume_id',
  },
  driveId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'drive_id',
  },
  customJdHash: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'custom_jd_hash',
  },
  overallMatchScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'overall_match_score',
  },
  technicalSkillsScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'technical_skills_score',
  },
  educationScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'education_score',
  },
  projectsScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'projects_score',
  },
  certificationsScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'certifications_score',
  },
  missingKeywords: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'missing_keywords',
  },
  missingSkills: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'missing_skills',
  },
  strongSections: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'strong_sections',
  },
  weakSections: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'weak_sections',
  },
});

module.exports = ResumeJDAnalysis;
