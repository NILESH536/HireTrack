'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Assessments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      company_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 60 },
      passing_score: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 50 },
      difficulty: { type: Sequelize.ENUM('EASY', 'MEDIUM', 'HARD'), defaultValue: 'MEDIUM' },
      instructions: { type: Sequelize.TEXT, allowNull: true },
      active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('Questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      assessment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Assessments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: { type: Sequelize.ENUM('MCQ', 'CODING', 'SQL', 'DEBUGGING'), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      marks: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 10 },
      mcq_options: { type: Sequelize.JSONB, allowNull: true },
      correct_answer: { type: Sequelize.TEXT, allowNull: true },
      test_cases: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('AssessmentAttempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assessment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Assessments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      drive_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Drives', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_time: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      end_time: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.ENUM('IN_PROGRESS', 'SUBMITTED', 'EVALUATED'), defaultValue: 'IN_PROGRESS' },
      total_score: { type: Sequelize.FLOAT, defaultValue: 0 },
      passed: { type: Sequelize.BOOLEAN, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('AssessmentSubmissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      attempt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'AssessmentAttempts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Questions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      student_answer: { type: Sequelize.TEXT, allowNull: true },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: true },
      score: { type: Sequelize.FLOAT, defaultValue: 0 },
      evaluation_feedback: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('AssessmentAttempts', ['student_id', 'assessment_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AssessmentSubmissions');
    await queryInterface.dropTable('AssessmentAttempts');
    await queryInterface.dropTable('Questions');
    await queryInterface.dropTable('Assessments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Questions_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Assessments_difficulty";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_AssessmentAttempts_status";');
  }
};
