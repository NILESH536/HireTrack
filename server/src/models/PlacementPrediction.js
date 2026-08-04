const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlacementPrediction = sequelize.define('PlacementPrediction', {
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
  readinessScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'readiness_score',
  },
  hiringProbability: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'hiring_probability',
  },
  careerReadiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'career_readiness',
  },
  technicalReadiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'technical_readiness',
  },
  resumeReadiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'resume_readiness',
  },
  interviewReadiness: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'interview_readiness',
  },
  skillGaps: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'skill_gaps',
  },
  recommendedPath: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'recommended_path',
  },
  recommendedCertifications: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'recommended_certifications',
  },
  recommendedProjects: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'recommended_projects',
  },
  companyRecommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'company_recommendations',
  }
});

module.exports = PlacementPrediction;
