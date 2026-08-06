'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflow_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('workflow_stages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'workflow_templates', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      stage_type: { 
        type: Sequelize.ENUM('APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'CUSTOM'), 
        allowNull: false, 
        defaultValue: 'CUSTOM' 
      },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addColumn('drives', 'workflow_template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'workflow_templates', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('applications', 'current_stage_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'workflow_stages', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('applications', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.createTable('application_transitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      from_stage_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'workflow_stages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      to_stage_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'workflow_stages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('MOVED', 'PASSED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'MOVED',
      },
      comments: { type: Sequelize.TEXT, allowNull: true },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      action_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('application_transitions');
    await queryInterface.removeColumn('applications', 'rejection_reason');
    await queryInterface.removeColumn('applications', 'current_stage_id');
    await queryInterface.removeColumn('drives', 'workflow_template_id');
    await queryInterface.dropTable('workflow_stages');
    await queryInterface.dropTable('workflow_templates');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WorkflowStages_stage_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ApplicationTransitions_status";');
  }
};
