const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
  },
  skills: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  careerGoal: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'career_goal',
  },
  placed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resumeText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'resume_text',
  },
  resumePath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'resume_path',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
});

module.exports = Student;
