const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id',
  },
  ownerType: {
    type: DataTypes.ENUM('STUDENT', 'COMPANY'),
    allowNull: false,
    field: 'owner_type',
  },
  documentType: {
    type: DataTypes.ENUM('RESUME', 'OFFER_LETTER', 'CERTIFICATE', 'COMPANY_REGISTRATION', 'OTHER'),
    allowNull: false,
    field: 'document_type',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_url',
  },
  verificationStatus: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING',
    field: 'verification_status',
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'verified_by',
  },
});

module.exports = Document;
