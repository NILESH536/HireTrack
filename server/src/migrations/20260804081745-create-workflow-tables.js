'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WorkflowTemplates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('WorkflowStages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'WorkflowTemplates', key: 'id' },
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
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addColumn('Drives', 'workflow_template_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'WorkflowTemplates', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Applications', 'current_stage_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'WorkflowStages', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Applications', 'rejection_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.createTable('ApplicationTransitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      from_stage_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'WorkflowStages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      to_stage_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'WorkflowStages', key: 'id' },
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
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ApplicationTransitions');
    await queryInterface.removeColumn('Applications', 'rejection_reason');
    await queryInterface.removeColumn('Applications', 'current_stage_id');
    await queryInterface.removeColumn('Drives', 'workflow_template_id');
    await queryInterface.dropTable('WorkflowStages');
    await queryInterface.dropTable('WorkflowTemplates');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WorkflowStages_stage_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ApplicationTransitions_status";');
  }
};
