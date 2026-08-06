'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('drive_matches');
    
    const removeCol = async (colName) => {
      if (tableInfo[colName]) {
        await queryInterface.removeColumn('drive_matches', colName);
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
    await queryInterface.addColumn('drive_matches', 'confidence_level', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('drive_matches', 'matched_skills', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('drive_matches', 'missing_skills', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('drive_matches', 'strengths', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('drive_matches', 'weaknesses', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('drive_matches', 'improvement_suggestions', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('drive_matches', 'reasoning_summary', { type: Sequelize.TEXT, allowNull: true });
  }
};
