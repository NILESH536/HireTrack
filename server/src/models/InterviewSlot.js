const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InterviewSlot = sequelize.define('InterviewSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  applicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'application_id',
  },
  roundType: {
    type: DataTypes.ENUM('APTITUDE_TEST', 'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'HR_ROUND'),
    allowNull: false,
    field: 'round_type',
  },
  interviewDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'interview_date_time',
  },
  mode: {
    type: DataTypes.ENUM('ONLINE', 'OFFLINE'),
    allowNull: false,
  },
  venueOrLink: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'venue_or_link',
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = InterviewSlot;
