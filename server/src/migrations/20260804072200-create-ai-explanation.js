'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_explanations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      positive_factors: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      negative_factors: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      missing_skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      missing_requirements: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      recommendations: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      confidence_score: {
        type: Sequelize.STRING,
        defaultValue: 'Medium',
      },
      reasoning_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add an index for faster polymorphic lookups
    await queryInterface.addIndex('ai_explanations', ['entity_id', 'entity_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_explanations');
  },
};
