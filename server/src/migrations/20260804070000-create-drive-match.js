'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('drive_matches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drive_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'drives',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      match_score: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      confidence_level: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      matched_skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      missing_skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      strengths: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      weaknesses: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      improvement_suggestions: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      expected_shortlisting_probability: {
        type: Sequelize.FLOAT,
        allowNull: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('drive_matches');
  },
};
