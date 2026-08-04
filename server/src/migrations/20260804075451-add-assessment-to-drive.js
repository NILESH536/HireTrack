'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Drives', 'assessment_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Assessments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Drives', 'assessment_id');
  }
};
