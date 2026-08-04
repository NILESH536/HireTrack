'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResumeJDAnalyses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      resume_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Resumes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drive_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Drives',
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('ResumeJDAnalyses', ['resume_id', 'drive_id']);
    await queryInterface.addIndex('ResumeJDAnalyses', ['resume_id', 'custom_jd_hash']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ResumeJDAnalyses');
  }
};
