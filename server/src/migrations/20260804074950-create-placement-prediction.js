'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('placement_predictions', {
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
      readiness_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      hiring_probability: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      career_readiness: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      technical_readiness: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      resume_readiness: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      interview_readiness: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      skill_gaps: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      recommended_path: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      recommended_certifications: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      recommended_projects: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      company_recommendations: {
        type: Sequelize.JSONB,
        defaultValue: [],
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

    await queryInterface.addIndex('placement_predictions', ['student_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('placement_predictions');
  }
};
