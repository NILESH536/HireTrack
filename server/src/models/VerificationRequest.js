const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VerificationRequest = sequelize.define('VerificationRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  entityType: {
    type: DataTypes.ENUM('STUDENT', 'COMPANY', 'DOCUMENT'),
    allowNull: false,
    field: 'entity_type',
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'entity_id',
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true, // Admin or Placement Officer
    field: 'verified_by',
  },
}, { tableName: 'verification_requests', underscored: true });

module.exports = VerificationRequest;
