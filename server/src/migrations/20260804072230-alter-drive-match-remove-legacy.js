'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('DriveMatches');
    
    const removeCol = async (colName) => {
      if (tableInfo[colName]) {
        await queryInterface.removeColumn('DriveMatches', colName);
      }
    };

    await removeCol('confidence_level');
    await removeCol('matched_skills');
    await removeCol('missing_skills');
    await removeCol('strengths');
    await removeCol('weaknesses');
    await removeCol('improvement_suggestions');
    await removeCol('reasoning_summary');
  },

  async down(queryInterface, Sequelize) {
    // Re-adding columns in case of rollback
    await queryInterface.addColumn('DriveMatches', 'confidence_level', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('DriveMatches', 'matched_skills', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('DriveMatches', 'missing_skills', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('DriveMatches', 'strengths', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('DriveMatches', 'weaknesses', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('DriveMatches', 'improvement_suggestions', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('DriveMatches', 'reasoning_summary', { type: Sequelize.TEXT, allowNull: true });
  }
};
