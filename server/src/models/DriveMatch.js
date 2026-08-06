const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriveMatch = sequelize.define('DriveMatch', {
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
  matchScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'match_score',
  },
  expectedShortlistingProbability: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'expected_shortlisting_probability',
  },
}, { tableName: 'drive_matches', underscored: true });

module.exports = DriveMatch;
