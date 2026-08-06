const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Drive = sequelize.define('Drive', {
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
  jobRole: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'job_role',
  },
  jobDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'job_description',
  },
  salaryLpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'salary_lpa',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  jobType: {
    type: DataTypes.ENUM('FULL_TIME', 'INTERNSHIP', 'BOTH'),
    allowNull: false,
    field: 'job_type',
  },
  minCgpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    field: 'min_cgpa',
  },
  eligibleBranches: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
    field: 'eligible_branches',
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'application_deadline',
  },
  driveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'drive_date',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  assessmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assessment_id',
  },
  workflowTemplateId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'workflow_template_id',
  },
}, { tableName: 'drives', underscored: true });

module.exports = Drive;
