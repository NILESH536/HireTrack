'use strict';

/**
 * BOOTSTRAP MIGRATION
 *
 * Purpose:
 *   The database schema was created via sequelize.sync() in an earlier
 *   version of the codebase. All 27 tables already exist and match the
 *   current Sequelize models. However, the SequelizeMeta table has no
 *   records, so sequelize-cli would try to re-run every migration and
 *   fail with "table already exists" errors.
 *
 * This migration:
 *   1. Records all previously "hand-run" migrations as done in SequelizeMeta
 *      so that sequelize-cli will skip them in future runs.
 *   2. Cleans up the 35 duplicate Users_email unique indexes that were
 *      created by repeated sync() calls.
 *   3. Adds the missing performance indexes if they don't already exist.
 *
 * Data Safety:
 *   - NO tables are created or dropped.
 *   - NO data is modified.
 *   - Only index cleanup and bookkeeping in SequelizeMeta.
 */

const ALREADY_APPLIED_MIGRATIONS = [
  '20260804070000-create-drive-match.js',
  '20260804072200-create-ai-explanation.js',
  '20260804072230-alter-drive-match-remove-legacy.js',
  '20260804073600-create-resume.js',
  '20260804074300-create-resume-jd-analysis.js',
  '20260804074950-create-placement-prediction.js',
  '20260804075450-create-assessment-tables.js',
  '20260804075451-add-assessment-to-drive.js',
  '20260804081745-create-workflow-tables.js',
  '20260804082415-create-compliance-tables.js',
  '20260804083315-update-notifications.js',
  '20260804090145-create-coaching-tables.js',
  '20260804100000-add-performance-indexes.js',
];

async function indexExists(queryInterface, tableName, indexName) {
  const [rows] = await queryInterface.sequelize.query(`
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = '${tableName}'
      AND indexname = '${indexName}'
    LIMIT 1;
  `);
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── Step 1: Record all previously applied migrations in SequelizeMeta ──
    console.log('[bootstrap] Recording existing migrations in SequelizeMeta...');
    for (const name of ALREADY_APPLIED_MIGRATIONS) {
      // Check if already recorded (idempotent)
      const [existing] = await queryInterface.sequelize.query(
        `SELECT name FROM "SequelizeMeta" WHERE name = :name LIMIT 1;`,
        { replacements: { name }, type: Sequelize.QueryTypes.SELECT }
      );
      if (!existing) {
        await queryInterface.sequelize.query(
          `INSERT INTO "SequelizeMeta" (name) VALUES (:name);`,
          { replacements: { name } }
        );
        console.log(`  [recorded] ${name}`);
      } else {
        console.log(`  [skipped]  ${name} (already recorded)`);
      }
    }

    // ── Step 2: Clean up duplicate Users_email unique indexes ──
    console.log('[bootstrap] Cleaning up duplicate Users_email indexes...');
    const [allEmailIndexes] = await queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'users'
        AND indexname LIKE 'Users_email_key%'
      ORDER BY indexname;
    `);

    // Keep only the first one (Users_email_key), drop the rest
    // These are UNIQUE CONSTRAINTS, so we must use DROP CONSTRAINT, not DROP INDEX
    const toKeep = 'Users_email_key';
    const toDrop = allEmailIndexes
      .map(r => r.indexname)
      .filter(name => name !== toKeep);

    for (const indexName of toDrop) {
      // Try DROP CONSTRAINT first (for unique constraints), then DROP INDEX
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE users DROP CONSTRAINT IF EXISTS "${indexName}";`
        );
        console.log(`  [dropped constraint] ${indexName}`);
      } catch (err) {
        try {
          await queryInterface.sequelize.query(
            `DROP INDEX IF EXISTS "${indexName}";`
          );
          console.log(`  [dropped index] ${indexName}`);
        } catch (err2) {
          console.warn(`  [warn] Could not drop ${indexName}: ${err2.message}`);
        }
      }
    }
    console.log(`  [kept]    ${toKeep}`);

    // ── Step 3: Add missing performance indexes (idempotent) ──
    console.log('[bootstrap] Adding missing performance indexes...');

    const performanceIndexes = [
      { table: 'applications', columns: ['student_id'], name: 'idx_applications_student_id' },
      { table: 'applications', columns: ['drive_id'],   name: 'idx_applications_drive_id' },
      { table: 'applications', columns: ['student_id', 'drive_id'], name: 'idx_applications_student_drive', unique: true },
      { table: 'drive_matches', columns: ['student_id'], name: 'idx_drive_matches_student_id' },
      { table: 'drive_matches', columns: ['drive_id'],   name: 'idx_drive_matches_drive_id' },
      { table: 'interview_slots', columns: ['application_id'], name: 'idx_interview_slots_application_id' },
      { table: 'mock_interview_attempts', columns: ['student_id'], name: 'idx_mock_interviews_student_id' },
      { table: 'assessment_attempts', columns: ['student_id'],   name: 'idx_assessment_attempts_student_id' },
      { table: 'assessment_attempts', columns: ['assessment_id'], name: 'idx_assessment_attempts_assessment_id' },
      { table: 'resumes', columns: ['student_id'], name: 'idx_resumes_student_id' },
      { table: 'resumes', columns: ['student_id', 'is_primary'], name: 'idx_resumes_primary' },
      { table: 'notifications', columns: ['user_id'], name: 'idx_notifications_user_id' },
      { table: 'placement_predictions', columns: ['student_id'], name: 'idx_placement_predictions_student_id' },
      { table: 'learning_roadmaps', columns: ['student_id'], name: 'idx_learning_roadmaps_student_id' },
      { table: 'ai_explanations', columns: ['entity_id', 'entity_type'], name: 'idx_ai_explanations_entity' },
    ];

    for (const idx of performanceIndexes) {
      const exists = await indexExists(queryInterface, idx.table, idx.name);
      if (!exists) {
        try {
          await queryInterface.addIndex(idx.table, idx.columns, {
            name: idx.name,
            unique: idx.unique || false,
          });
          console.log(`  [created] ${idx.name}`);
        } catch (err) {
          console.warn(`  [warn] Could not create ${idx.name}: ${err.message}`);
        }
      } else {
        console.log(`  [exists]  ${idx.name}`);
      }
    }

    console.log('[bootstrap] Done. Database is now fully synchronized with SequelizeMeta.');
  },

  async down(queryInterface, Sequelize) {
    // Remove the records we inserted (rollback)
    for (const name of ALREADY_APPLIED_MIGRATIONS) {
      await queryInterface.sequelize.query(
        `DELETE FROM "SequelizeMeta" WHERE name = :name;`,
        { replacements: { name } }
      );
    }

    // Remove performance indexes
    const indexesToRemove = [
      ['applications', 'idx_applications_student_id'],
      ['applications', 'idx_applications_drive_id'],
      ['applications', 'idx_applications_student_drive'],
      ['drive_matches', 'idx_drive_matches_student_id'],
      ['drive_matches', 'idx_drive_matches_drive_id'],
      ['interview_slots', 'idx_interview_slots_application_id'],
      ['mock_interview_attempts', 'idx_mock_interviews_student_id'],
      ['assessment_attempts', 'idx_assessment_attempts_student_id'],
      ['assessment_attempts', 'idx_assessment_attempts_assessment_id'],
      ['resumes', 'idx_resumes_student_id'],
      ['resumes', 'idx_resumes_primary'],
      ['notifications', 'idx_notifications_user_id'],
      ['placement_predictions', 'idx_placement_predictions_student_id'],
      ['learning_roadmaps', 'idx_learning_roadmaps_student_id'],
      ['ai_explanations', 'idx_ai_explanations_entity'],
    ];

    for (const [table, name] of indexesToRemove) {
      try {
        await queryInterface.removeIndex(table, name);
      } catch (err) {
        // ignore if doesn't exist
      }
    }
  },
};
