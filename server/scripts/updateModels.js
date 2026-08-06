const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

const toSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const pluralize = str => {
  if (str.endsWith('s')) return str;
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (str.endsWith('ch')) return str + 'es';
  if (str.endsWith('Analysis')) return str.replace('Analysis', 'Analyses');
  return str + 's';
};

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const modelName = file.replace('.js', '');
  
  // Pluralize and convert to lowercase/snake_case based on DB convention
  // Based on Neon DB, we have 'users', 'students', 'companies', 'drives', 'applications', 'interview_slots', 'notifications', 'chat_messages'
  let tableName;
  if (modelName === 'InterviewSlot') tableName = 'interview_slots';
  else if (modelName === 'ChatMessage') tableName = 'chat_messages';
  else if (modelName === 'DriveMatch') tableName = 'drive_matches';
  else if (modelName === 'AIExplanation') tableName = 'ai_explanations';
  else if (modelName === 'ResumeJDAnalysis') tableName = 'resume_jd_analyses';
  else if (modelName === 'PlacementPrediction') tableName = 'placement_predictions';
  else if (modelName === 'AssessmentAttempt') tableName = 'assessment_attempts';
  else if (modelName === 'AssessmentSubmission') tableName = 'assessment_submissions';
  else if (modelName === 'WorkflowTemplate') tableName = 'workflow_templates';
  else if (modelName === 'WorkflowStage') tableName = 'workflow_stages';
  else if (modelName === 'ApplicationTransition') tableName = 'application_transitions';
  else if (modelName === 'AuditLog') tableName = 'audit_logs';
  else if (modelName === 'VerificationRequest') tableName = 'verification_requests';
  else if (modelName === 'MockInterviewAttempt') tableName = 'mock_interview_attempts';
  else if (modelName === 'MockInterviewQuestion') tableName = 'mock_interview_questions';
  else if (modelName === 'LearningRoadmap') tableName = 'learning_roadmaps';
  else tableName = pluralize(modelName).toLowerCase();

  // We need to inject tableName inside the options object of sequelize.define.
  const defineMatch = content.match(/sequelize\.define\(['"]\w+['"],\s*\{([\s\S]*?)\}\s*(,\s*\{([\s\S]*?)\})?\);/);
  
  if (defineMatch) {
    const fields = defineMatch[1];
    let options = defineMatch[3] || '';
    
    // Add tableName if it doesn't exist
    if (!options.includes('tableName')) {
      options = options.trim();
      if (options.length > 0 && !options.endsWith(',')) options += ', ';
      options += `tableName: '${tableName}', underscored: true`;
      
      let newOptionsStr = options ? `, { ${options} }` : `, { tableName: '${tableName}', underscored: true }`;
      
      const newContent = content.replace(defineMatch[0], `sequelize.define('${modelName}', {${fields}}${newOptionsStr});`);
      fs.writeFileSync(filePath, newContent);
      console.log('Updated ' + file + ' with tableName: ' + tableName);
    }
  }
});
