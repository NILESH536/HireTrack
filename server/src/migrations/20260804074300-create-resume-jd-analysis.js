'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resume_jd_analyses', {
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
      resume_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'resumes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drive_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'drives',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      custom_jd_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      overall_match_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      technical_skills_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      education_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      projects_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      certifications_score: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      missing_keywords: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      missing_skills: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      strong_sections: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      weak_sections: {
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

    await queryInterface.addIndex('resume_jd_analyses', ['resume_id', 'drive_id']);
    await queryInterface.addIndex('resume_jd_analyses', ['resume_id', 'custom_jd_hash']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('resume_jd_analyses');
  }
};
