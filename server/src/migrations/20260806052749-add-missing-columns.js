'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Students
    await queryInterface.addColumn('students', 'is_verified', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('students', 'verified_at', { type: Sequelize.DATE, allowNull: true });

    // Companies
    await queryInterface.addColumn('companies', 'is_verified', { type: Sequelize.BOOLEAN, defaultValue: false });
    await queryInterface.addColumn('companies', 'verified_at', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('companies', 'approval_status', { type: Sequelize.STRING, defaultValue: 'PENDING' });
    await queryInterface.addColumn('companies', 'rejection_reason', { type: Sequelize.TEXT, allowNull: true });

    // Applications
    await queryInterface.addColumn('applications', 'current_stage_id', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addColumn('applications', 'rejection_reason', { type: Sequelize.TEXT, allowNull: true });

    // Drives
    await queryInterface.addColumn('drives', 'assessment_id', { type: Sequelize.UUID, allowNull: true });
    await queryInterface.addColumn('drives', 'workflow_template_id', { type: Sequelize.UUID, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    // Drives
    await queryInterface.removeColumn('drives', 'workflow_template_id');
    await queryInterface.removeColumn('drives', 'assessment_id');

    // Applications
    await queryInterface.removeColumn('applications', 'rejection_reason');
    await queryInterface.removeColumn('applications', 'current_stage_id');

    // Companies
    await queryInterface.removeColumn('companies', 'rejection_reason');
    await queryInterface.removeColumn('companies', 'approval_status');
    await queryInterface.removeColumn('companies', 'verified_at');
    await queryInterface.removeColumn('companies', 'is_verified');

    // Students
    await queryInterface.removeColumn('students', 'verified_at');
    await queryInterface.removeColumn('students', 'is_verified');
  }
};
