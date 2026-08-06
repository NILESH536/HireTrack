'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Indexes on frequently joined and queried foreign keys
    await queryInterface.addIndex('applications', ['student_id'], { name: 'idx_applications_student_id' });
    await queryInterface.addIndex('applications', ['drive_id'], { name: 'idx_applications_drive_id' });
    await queryInterface.addIndex('applications', ['student_id', 'drive_id'], { name: 'idx_applications_student_drive', unique: true });

    await queryInterface.addIndex('drive_matches', ['student_id'], { name: 'idx_drive_matches_student_id' });
    await queryInterface.addIndex('drive_matches', ['drive_id'], { name: 'idx_drive_matches_drive_id' });

    await queryInterface.addIndex('interview_slots', ['application_id'], { name: 'idx_interview_slots_application_id' });

    // Indexes for recent Coaching & Assessment tables
    await queryInterface.addIndex('mock_interview_attempts', ['student_id'], { name: 'idx_mock_interviews_student_id' });
    await queryInterface.addIndex('assessment_attempts', ['student_id'], { name: 'idx_assessment_attempts_student_id' });
    await queryInterface.addIndex('assessment_attempts', ['assessment_id'], { name: 'idx_assessment_attempts_assessment_id' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('applications', 'idx_applications_student_id');
    await queryInterface.removeIndex('applications', 'idx_applications_drive_id');
    await queryInterface.removeIndex('applications', 'idx_applications_student_drive');

    await queryInterface.removeIndex('drive_matches', 'idx_drive_matches_student_id');
    await queryInterface.removeIndex('drive_matches', 'idx_drive_matches_drive_id');

    await queryInterface.removeIndex('interview_slots', 'idx_interview_slots_application_id');

    await queryInterface.removeIndex('mock_interview_attempts', 'idx_mock_interviews_student_id');
    await queryInterface.removeIndex('assessment_attempts', 'idx_assessment_attempts_student_id');
    await queryInterface.removeIndex('assessment_attempts', 'idx_assessment_attempts_assessment_id');
  }
};
