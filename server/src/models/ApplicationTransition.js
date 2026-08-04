const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApplicationTransition = sequelize.define('ApplicationTransition', {
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
  fromStageId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'from_stage_id',
  },
  toStageId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'to_stage_id',
  },
  status: {
    type: DataTypes.ENUM('MOVED', 'PASSED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'MOVED',
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason',
  },
  actionBy: {
    type: DataTypes.UUID,
    allowNull: false, // User ID who made the change (Recruiter or System)
    field: 'action_by',
  },
});

module.exports = ApplicationTransition;
