'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resumes', {
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
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      raw_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ats_score: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      structured_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      ai_summary: {
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

    await queryInterface.addIndex('resumes', ['student_id', 'is_primary']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('resumes');
  }
};
