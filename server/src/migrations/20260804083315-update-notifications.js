'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notifications', 'action_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    await queryInterface.addColumn('notifications', 'priority', {
      type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
      allowNull: false,
      defaultValue: 'LOW',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notifications', 'priority');
    await queryInterface.removeColumn('notifications', 'action_url');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_priority";');
  }
};
