const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIExplanation = sequelize.define('AIExplanation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'entity_id',
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_type',
  },
  positiveFactors: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'positive_factors',
  },
  negativeFactors: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'negative_factors',
  },
  missingSkills: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'missing_skills',
  },
  missingRequirements: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'missing_requirements',
  },
  recommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  confidenceScore: {
    type: DataTypes.STRING,
    defaultValue: 'Medium',
    field: 'confidence_score',
  },
  reasoningSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reasoning_summary',
  },
}, { tableName: 'ai_explanations', underscored: true });

module.exports = AIExplanation;
