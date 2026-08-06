const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Assessment = sequelize.define('Assessment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'duration_minutes',
  },
  passingScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 50,
    field: 'passing_score',
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    defaultValue: 'MEDIUM',
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, { tableName: 'assessments', underscored: true });

module.exports = Assessment;
