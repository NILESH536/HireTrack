const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LearningRoadmap = sequelize.define('LearningRoadmap', {
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
  roadmapData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'roadmap_data',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
}, { tableName: 'learning_roadmaps', underscored: true });

module.exports = LearningRoadmap;
