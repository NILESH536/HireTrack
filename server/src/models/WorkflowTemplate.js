const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkflowTemplate = sequelize.define('WorkflowTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: true, // If null, it's a global template (e.g. system default)
    field: 'company_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
}, { tableName: 'workflow_templates', underscored: true });

module.exports = WorkflowTemplate;
