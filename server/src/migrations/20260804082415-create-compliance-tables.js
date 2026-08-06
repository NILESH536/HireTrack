'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action_type: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING, allowNull: true },
      entity_id: { type: Sequelize.UUID, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.STRING, allowNull: true },
      user_agent: { type: Sequelize.STRING, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('verification_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      entity_type: {
        type: Sequelize.ENUM('STUDENT', 'COMPANY', 'DOCUMENT'),
        allowNull: false,
      },
      entity_id: { type: Sequelize.UUID, allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      comments: { type: Sequelize.TEXT, allowNull: true },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      owner_id: { type: Sequelize.UUID, allowNull: false },
      owner_type: {
        type: Sequelize.ENUM('STUDENT', 'COMPANY'),
        allowNull: false,
      },
      document_type: {
        type: Sequelize.ENUM('RESUME', 'OFFER_LETTER', 'CERTIFICATE', 'COMPANY_REGISTRATION', 'OTHER'),
        allowNull: false,
      },
      file_url: { type: Sequelize.STRING, allowNull: false },
      verification_status: {
        type: Sequelize.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addColumn('students', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('students', 'verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('companies', 'approval_status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('companies', 'approval_status');
    await queryInterface.removeColumn('companies', 'is_verified');
    await queryInterface.removeColumn('students', 'verified_at');
    await queryInterface.removeColumn('students', 'is_verified');

    await queryInterface.dropTable('documents');
    await queryInterface.dropTable('verification_requests');
    await queryInterface.dropTable('audit_logs');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_VerificationRequests_entity_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_VerificationRequests_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_owner_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_document_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_verification_status";');
  }
};
