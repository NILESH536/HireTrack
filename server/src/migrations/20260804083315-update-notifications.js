'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Notifications', 'action_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('Notifications', 'priority', {
      type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: false,
      defaultValue: 'LOW',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Notifications', 'priority');
    await queryInterface.removeColumn('Notifications', 'action_url');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_priority";');
  }
};
