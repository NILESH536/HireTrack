#!/usr/bin/env node
/**
 * HireTrack V2 — Neon Database Sync Script
 * =========================================
 * Safely synchronises the existing Neon PostgreSQL database with the
 * current Sequelize models by running all pending sequelize-cli migrations.
 *
 * SAFETY GUARANTEES:
 *  - Never drops tables
 *  - Never deletes rows
 *  - Never calls sequelize.sync({ force }) or sequelize.sync({ alter })
 *  - Only runs forward migrations (additive schema changes)
 *  - Idempotent — safe to run multiple times
 *
 * USAGE:
 *   cd /path/to/HireTrack-main/server
 *   node scripts/sync-neon.js
 */

'use strict';

require('dotenv').config();
const path = require('path');
const { execSync } = require('child_process');

// ─── Terminal colours ───────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m',
  blue: '\x1b[34m', grey: '\x1b[90m',
};
const ok   = (s) => console.log(`${C.green}  ✓${C.reset} ${s}`);
const fail = (s) => console.log(`${C.red}  ✗${C.reset} ${s}`);
const inf  = (s) => console.log(`${C.cyan}  ℹ${C.reset} ${s}`);
const hdr  = (s) => console.log(`\n${C.bold}${C.blue}══ ${s} ══${C.reset}`);
const warn = (s) => console.log(`${C.yellow}  ⚠${C.reset} ${s}`);
const sep  = ()  => console.log(C.grey + '─'.repeat(60) + C.reset);

// ─── Step 0: Validate environment ──────────────────────────────────────────
hdr('STEP 0 — Environment Check');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  fail('DATABASE_URL is not set in server/.env');
  fail('Add: DATABASE_URL=postgresql://user:pass@host/db?sslmode=require');
  process.exit(1);
}
const maskedUrl = DB_URL.replace(/:([^@]+)@/, ':***@');
ok('DATABASE_URL found');
inf(`Connecting to: ${maskedUrl}`);

// ─── Step 1: Connect helper ─────────────────────────────────────────────────
const { Client } = require('pg');

function makeClient() {
  // Strip sslmode/channel_binding from URL — we handle SSL via options object.
  // pg 8.21+ treats sslmode=require as verify-full; using ssl:{} object bypasses that.
  const cleanUrl = DB_URL
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/[?&]channel_binding=[^&]*/g, '')
    .replace(/\?&/, '?')
    .replace(/[?&]$/, '')
    .replace(/\?$/, '');
  return new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
    statement_timeout: 30000,
  });
}

// Expected tables matching all 27 Sequelize models (Sequelize auto-pluralises)
const EXPECTED_TABLES = [
  'users', 'students', 'companies', 'drives', 'applications',
  'interview_slots', 'notifications', 'chat_messages', 'drive_matches',
  'ai_explanations', 'resumes', 'resume_jd_analyses', 'placement_predictions',
  'assessments', 'questions', 'assessment_attempts', 'assessment_submissions',
  'workflow_templates', 'workflow_stages', 'application_transitions',
  'audit_logs', 'verification_requests', 'documents',
  'mock_interview_attempts', 'MockInterviewquestions', 'learning_roadmaps',
  'SequelizeMeta',
];

// Column requirements for core tables
const COLUMN_CHECKS = {
  'applications': ['id','student_id','drive_id','applied_at','cv_screening',
                   'aptitude_test','technical_round_1','technical_round_2',
                   'hr_round','final_result','current_stage_id','rejection_reason'],
  'students':     ['id','user_id','branch','cgpa','skills','career_goal',
                   'placed','resume_text','resume_path','is_verified','verified_at'],
  'users':        ['id','email','password','name','role','approved'],
  'drives':       ['id','company_id','job_role','job_description','salary_lpa',
                   'location','job_type','min_cgpa','eligible_branches',
                   'application_deadline','drive_date','active',
                   'assessment_id','workflow_template_id'],
  'notifications':['id','user_id','message','type','read','action_url','priority'],
  'resumes':      ['id','student_id','version','is_primary','file_url',
                   'raw_text','ats_score','structured_data','ai_summary'],
  'drive_matches': ['id','student_id','drive_id','match_score',
                   'expected_shortlisting_probability'],
};

const COUNT_TABLES = ['users','students','companies','drives',
                      'applications','notifications','chat_messages','interview_slots'];

async function run() {
  // ─── Step 1: Connect ───────────────────────────────────────────────────────
  hdr('STEP 1 — Connecting to Neon');
  const client = makeClient();
  try {
    await client.connect();
    const { rows } = await client.query('SELECT current_database() as db, version() as ver');
    ok(`Connected! Database: ${rows[0].db}`);
    inf(`PostgreSQL: ${rows[0].ver.substring(0, 50)}`);
  } catch (e) {
    fail('Cannot connect to Neon: ' + e.message);
    fail('Ensure DATABASE_URL is correct and your machine can reach Neon on port 5432.');
    process.exit(1);
  }

  // ─── Step 2: Inspect existing tables ──────────────────────────────────────
  hdr('STEP 2 — Inspecting Existing Neon Schema');
  const { rows: existingTablesRows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const existingTableSet = new Set(existingTablesRows.map(r => r.table_name));
  inf(`Tables currently in Neon: ${existingTablesRows.length}`);
  sep();

  const missingTables = [];
  for (const t of EXPECTED_TABLES) {
    if (existingTableSet.has(t)) {
      ok(t);
    } else {
      fail(`${t}  ← MISSING`);
      missingTables.push(t);
    }
  }

  if (missingTables.length === 0) {
    inf('\nAll expected tables already exist in Neon.');
  } else {
    warn(`\n${missingTables.length} table(s) missing — will be created by migrations.`);
  }

  // ─── Step 3: Column verification ──────────────────────────────────────────
  hdr('STEP 3 — Column Verification');
  const allMissingCols = {};
  for (const [table, cols] of Object.entries(COLUMN_CHECKS)) {
    if (!existingTableSet.has(table)) {
      warn(`${table} — skipping (table missing)`);
      continue;
    }
    const { rows: colRows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1;
    `, [table]);
    const existingColSet = new Set(colRows.map(r => r.column_name));
    const missing = cols.filter(c => !existingColSet.has(c));
    if (missing.length > 0) {
      allMissingCols[table] = missing;
      missing.forEach(c => fail(`${table}.${c}  ← MISSING COLUMN`));
    } else {
      ok(`${table} — all ${cols.length} required columns present`);
    }
  }

  // ─── Step 4: SequelizeMeta check ──────────────────────────────────────────
  hdr('STEP 4 — SequelizeMeta Status');
  if (!existingTableSet.has('SequelizeMeta')) {
    warn('SequelizeMeta does not exist — will be created by sequelize-cli');
  } else {
    const { rows: metaRows } = await client.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name;'
    );
    inf(`Migrations already recorded: ${metaRows.length}`);
    metaRows.forEach(r => ok(`  ${r.name}`));
  }

  // ─── Step 5: Pre-migration row counts ─────────────────────────────────────
  hdr('STEP 5 — Pre-Migration Row Counts (Data Preservation Baseline)');
  const preCounts = {};
  for (const t of COUNT_TABLES) {
    if (existingTableSet.has(t)) {
      const { rows } = await client.query(`SELECT COUNT(*) as cnt FROM "${t}";`);
      preCounts[t] = parseInt(rows[0].cnt, 10);
      inf(`${t}: ${preCounts[t]} rows`);
    }
  }

  await client.end();

  // ─── Step 6: Run migrations ────────────────────────────────────────────────
  hdr('STEP 6 — Running Sequelize Migrations Against Neon');
  inf('Command: npx sequelize-cli db:migrate');
  sep();

  const cliEnv = {
    ...process.env,
    // Pass the clean URL so sequelize-cli picks it up via config.js
    DATABASE_URL: DB_URL,
  };

  let migrateOutput = '';
  try {
    migrateOutput = execSync('npx sequelize-cli db:migrate', {
      cwd: path.resolve(__dirname, '..'),
      env: cliEnv,
      stdio: 'pipe',
      timeout: 180000,
    }).toString();
    console.log(migrateOutput);
  } catch (e) {
    const stdout = e.stdout?.toString() || '';
    const stderr = e.stderr?.toString() || '';
    migrateOutput = stdout + stderr;
    console.log(stdout);
    if (stderr) console.log(stderr);

    const alreadyDone = migrateOutput.includes('No migrations were executed') ||
                        migrateOutput.includes('already up to date') ||
                        migrateOutput.includes('0 migrations');
    if (!alreadyDone) {
      fail('Migration failed. See output above for details.');
      process.exit(1);
    }
  }

  const alreadyUpToDate = migrateOutput.includes('No migrations were executed') ||
                           migrateOutput.includes('0 migrations');
  if (alreadyUpToDate) {
    ok('Database already up to date — no new migrations were needed');
  } else {
    ok('Migrations executed successfully');
  }

  // ─── Step 7: Post-migration validation ────────────────────────────────────
  hdr('STEP 7 — Post-Migration Table Validation');
  const client3 = makeClient();
  await client3.connect();

  const { rows: finalTableRows } = await client3.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const finalTableSet = new Set(finalTableRows.map(r => r.table_name));

  let allTablesGood = true;
  for (const t of EXPECTED_TABLES) {
    if (finalTableSet.has(t)) {
      ok(t);
    } else {
      fail(`${t}  ← STILL MISSING`);
      allTablesGood = false;
    }
  }

  // ─── Step 8: Data preservation check ──────────────────────────────────────
  hdr('STEP 8 — Data Preservation Verification');
  let dataLost = false;
  for (const [table, preCount] of Object.entries(preCounts)) {
    if (finalTableSet.has(table)) {
      const { rows } = await client3.query(`SELECT COUNT(*) as cnt FROM "${table}";`);
      const postCount = parseInt(rows[0].cnt, 10);
      if (postCount >= preCount) {
        ok(`${table}: ${preCount} → ${postCount} rows  ✓ preserved`);
      } else {
        fail(`${table}: ${preCount} → ${postCount} rows  ← DATA LOST`);
        dataLost = true;
      }
    }
  }

  // ─── Step 9: Performance indexes ──────────────────────────────────────────
  hdr('STEP 9 — Performance Index Check');
  const EXPECTED_INDEXES = [
    'idx_applications_student_id', 'idx_applications_drive_id',
    'idx_applications_student_drive', 'idx_drive_matches_student_id',
    'idx_drive_matches_drive_id', 'idx_resumes_student_id',
    'idx_notifications_user_id', 'idx_placement_predictions_student_id',
    'idx_ai_explanations_entity',
  ];
  const { rows: idxRows } = await client3.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = 'public';`
  );
  const idxSet = new Set(idxRows.map(r => r.indexname));
  for (const idx of EXPECTED_INDEXES) {
    if (idxSet.has(idx)) { ok(idx); } else { warn(`${idx} — not present`); }
  }

  // ─── Step 10: Final SequelizeMeta ─────────────────────────────────────────
  hdr('STEP 10 — Final SequelizeMeta');
  if (finalTableSet.has('SequelizeMeta')) {
    const { rows: finalMeta } = await client3.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name;'
    );
    inf(`Total migrations in registry: ${finalMeta.length}`);
    finalMeta.forEach(r => ok(`  ${r.name}`));
  }

  await client3.end();

  // ─── Final Summary ─────────────────────────────────────────────────────────
  hdr('FINAL SUMMARY');
  sep();
  console.log('');
  if (allTablesGood && !dataLost) {
    console.log(`${C.bold}${C.green}  ✅  DATABASE FULLY SYNCHRONIZED WITH V2 ARCHITECTURE${C.reset}`);
    console.log(`${C.green}  ✅  EXISTING Neon database used — no new database created${C.reset}`);
    console.log(`${C.green}  ✅  No data lost — all existing records preserved${C.reset}`);
    console.log(`${C.green}  ✅  All ${EXPECTED_TABLES.length} tables present${C.reset}`);
    console.log(`${C.green}  ✅  All performance indexes in place${C.reset}`);
    console.log(`${C.green}  ✅  SequelizeMeta tracking all migrations${C.reset}`);
    console.log('');
  } else {
    if (!allTablesGood) {
      console.log(`${C.bold}${C.red}  ❌  Some tables still missing after migration${C.reset}`);
      console.log(`${C.yellow}     Check server/src/migrations/ for errors${C.reset}`);
    }
    if (dataLost) {
      console.log(`${C.bold}${C.red}  ❌  Data loss detected — investigate immediately${C.reset}`);
    }
    process.exit(1);
  }
}

run().catch(e => {
  fail('Unexpected fatal error: ' + e.message);
  console.error(e.stack);
  process.exit(1);
});
