'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mock_interview_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      interview_type: {
        type: Sequelize.ENUM('HR', 'TECHNICAL', 'BEHAVIORAL', 'ROLE_SPECIFIC'),
        allowNull: false,
      },
      job_role: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('IN_PROGRESS', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'IN_PROGRESS',
      },
      overall_score: { type: Sequelize.INTEGER, allowNull: true },
      feedback: { type: Sequelize.JSONB, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('mock_interview_questions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      attempt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'mock_interview_attempts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question: { type: Sequelize.TEXT, allowNull: false },
      user_answer: { type: Sequelize.TEXT, allowNull: true },
      ai_feedback: { type: Sequelize.JSONB, allowNull: true },
      score: { type: Sequelize.INTEGER, allowNull: true },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('learning_roadmaps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      roadmap_data: { type: Sequelize.JSONB, allowNull: false },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'COMPLETED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('learning_roadmaps');
    await queryInterface.dropTable('mock_interview_questions');
    await queryInterface.dropTable('mock_interview_attempts');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_LearningRoadmaps_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_MockInterviewAttempts_interview_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_MockInterviewAttempts_status";');
  }
};
