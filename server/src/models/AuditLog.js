const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actorId: {
    type: DataTypes.UUID,
    allowNull: true, // System actions might not have an actor
    field: 'actor_id',
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'action_type',
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'entity_type',
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'entity_id',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address',
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_agent',
  },
}, { tableName: 'audit_logs', underscored: true });

module.exports = AuditLog;
