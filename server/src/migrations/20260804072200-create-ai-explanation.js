'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AIExplanations', {
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add an index for faster polymorphic lookups
    await queryInterface.addIndex('AIExplanations', ['entity_id', 'entity_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AIExplanations');
  },
};
