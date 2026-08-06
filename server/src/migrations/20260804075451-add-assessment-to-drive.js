'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('drives', 'assessment_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'assessments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('drives', 'assessment_id');
  }
};
