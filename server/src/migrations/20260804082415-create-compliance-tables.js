'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      actor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action_type: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING, allowNull: true },
      entity_id: { type: Sequelize.UUID, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      ip_address: { type: Sequelize.STRING, allowNull: true },
      user_agent: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('VerificationRequests', {
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
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('Documents', {
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
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addColumn('Students', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('Students', 'verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Companies', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('Companies', 'approval_status', {
      type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Companies', 'approval_status');
    await queryInterface.removeColumn('Companies', 'is_verified');
    await queryInterface.removeColumn('Students', 'verified_at');
    await queryInterface.removeColumn('Students', 'is_verified');

    await queryInterface.dropTable('Documents');
    await queryInterface.dropTable('VerificationRequests');
    await queryInterface.dropTable('AuditLogs');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_VerificationRequests_entity_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_VerificationRequests_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_owner_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_document_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Documents_verification_status";');
  }
};
