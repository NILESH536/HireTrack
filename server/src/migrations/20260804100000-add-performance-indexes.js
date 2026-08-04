'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Indexes on frequently joined and queried foreign keys
    await queryInterface.addIndex('Applications', ['student_id'], { name: 'idx_applications_student_id' });
    await queryInterface.addIndex('Applications', ['drive_id'], { name: 'idx_applications_drive_id' });
    await queryInterface.addIndex('Applications', ['student_id', 'drive_id'], { name: 'idx_applications_student_drive', unique: true });

    await queryInterface.addIndex('DriveMatches', ['student_id'], { name: 'idx_drive_matches_student_id' });
    await queryInterface.addIndex('DriveMatches', ['drive_id'], { name: 'idx_drive_matches_drive_id' });

    await queryInterface.addIndex('InterviewSlots', ['application_id'], { name: 'idx_interview_slots_application_id' });

    // Indexes for recent Coaching & Assessment tables
    await queryInterface.addIndex('MockInterviewAttempts', ['student_id'], { name: 'idx_mock_interviews_student_id' });
    await queryInterface.addIndex('AssessmentAttempts', ['student_id'], { name: 'idx_assessment_attempts_student_id' });
    await queryInterface.addIndex('AssessmentAttempts', ['assessment_id'], { name: 'idx_assessment_attempts_assessment_id' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Applications', 'idx_applications_student_id');
    await queryInterface.removeIndex('Applications', 'idx_applications_drive_id');
    await queryInterface.removeIndex('Applications', 'idx_applications_student_drive');

    await queryInterface.removeIndex('DriveMatches', 'idx_drive_matches_student_id');
    await queryInterface.removeIndex('DriveMatches', 'idx_drive_matches_drive_id');

    await queryInterface.removeIndex('InterviewSlots', 'idx_interview_slots_application_id');

    await queryInterface.removeIndex('MockInterviewAttempts', 'idx_mock_interviews_student_id');
    await queryInterface.removeIndex('AssessmentAttempts', 'idx_assessment_attempts_student_id');
    await queryInterface.removeIndex('AssessmentAttempts', 'idx_assessment_attempts_assessment_id');
  }
};
