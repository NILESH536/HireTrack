const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowStage = sequelize.define('WorkflowStage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'template_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stageType: {
    type: DataTypes.ENUM('APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'CUSTOM'),
    allowNull: false,
    defaultValue: 'CUSTOM',
    field: 'stage_type',
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_index',
  },
}, { tableName: 'workflow_stages', underscored: true });

module.exports = WorkflowStage;
