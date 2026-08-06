const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../src/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js') && f !== '20260804110000-bootstrap-sequelizeMeta-and-cleanup.js');

const toSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
const pluralize = str => {
  if (str.endsWith('s')) return str;
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (str.endsWith('ch')) return str + 'es';
  if (str.endsWith('Analysis')) return str.replace('Analysis', 'Analyses');
  return str + 's';
};

const getTableName = (modelName) => {
  if (modelName === 'InterviewSlot') return 'interview_slots';
  if (modelName === 'ChatMessage') return 'chat_messages';
  if (modelName === 'DriveMatch') return 'drive_matches';
  if (modelName === 'AIExplanation') return 'ai_explanations';
  if (modelName === 'ResumeJDAnalysis') return 'resume_jd_analyses';
  if (modelName === 'PlacementPrediction') return 'placement_predictions';
  if (modelName === 'AssessmentAttempt') return 'assessment_attempts';
  if (modelName === 'AssessmentSubmission') return 'assessment_submissions';
  if (modelName === 'WorkflowTemplate') return 'workflow_templates';
  if (modelName === 'WorkflowStage') return 'workflow_stages';
  if (modelName === 'ApplicationTransition') return 'application_transitions';
  if (modelName === 'AuditLog') return 'audit_logs';
  if (modelName === 'VerificationRequest') return 'verification_requests';
  if (modelName === 'MockInterviewAttempt') return 'mock_interview_attempts';
  if (modelName === 'MockInterviewQuestion') return 'mock_interview_questions';
  if (modelName === 'LearningRoadmap') return 'learning_roadmaps';
  return pluralize(modelName).toLowerCase();
};

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Replace createTable('ModelName' with lowercase plural
  content = content.replace(/queryInterface\.createTable\(['"]([A-Za-z0-9]+)['"]/g, (match, modelName) => {
    return `queryInterface.createTable('${getTableName(modelName)}'`;
  });
  
  // 2. Replace dropTable('ModelName'
  content = content.replace(/queryInterface\.dropTable\(['"]([A-Za-z0-9]+)['"]/g, (match, modelName) => {
    return `queryInterface.dropTable('${getTableName(modelName)}'`;
  });
  
  // 3. Replace references: { model: 'ModelName'
  content = content.replace(/references:\s*\{\s*model:\s*['"]([A-Za-z0-9]+)['"]/g, (match, modelName) => {
    return `references: { model: '${getTableName(modelName)}'`;
  });

  // 4. Replace addColumn('ModelName'
  content = content.replace(/queryInterface\.addColumn\(['"]([A-Za-z0-9]+)['"]/g, (match, modelName) => {
    return `queryInterface.addColumn('${getTableName(modelName)}'`;
  });

  // 5. Replace createdAt and updatedAt with created_at and updated_at
  content = content.replace(/createdAt:/g, 'created_at:');
  content = content.replace(/updatedAt:/g, 'updated_at:');

  fs.writeFileSync(filePath, content);
  console.log('Updated migration: ' + file);
});
