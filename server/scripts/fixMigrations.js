const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../src/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));

const tableMap = {
  'Applications': 'applications',
  'Users': 'users',
  'Students': 'students',
  'Companies': 'companies',
  'Drives': 'drives',
  'InterviewSlots': 'interview_slots',
  'Notifications': 'notifications',
  'ChatMessages': 'chat_messages',
  'DriveMatches': 'drive_matches',
  'AIExplanations': 'ai_explanations',
  'aiexplanations': 'ai_explanations',
  'Resumes': 'resumes',
  'ResumeJDAnalyses': 'resume_jd_analyses',
  'resumejdanalyses': 'resume_jd_analyses',
  'PlacementPredictions': 'placement_predictions',
  'placementpredictions': 'placement_predictions',
  'Assessments': 'assessments',
  'Questions': 'questions',
  'AssessmentAttempts': 'assessment_attempts',
  'assessmentattempts': 'assessment_attempts',
  'AssessmentSubmissions': 'assessment_submissions',
  'assessmentsubmissions': 'assessment_submissions',
  'WorkflowTemplates': 'workflow_templates',
  'workflowtemplates': 'workflow_templates',
  'WorkflowStages': 'workflow_stages',
  'workflowstages': 'workflow_stages',
  'ApplicationTransitions': 'application_transitions',
  'applicationtransitions': 'application_transitions',
  'AuditLogs': 'audit_logs',
  'auditlogs': 'audit_logs',
  'VerificationRequests': 'verification_requests',
  'verificationrequests': 'verification_requests',
  'Documents': 'documents',
  'MockInterviewAttempts': 'mock_interview_attempts',
  'mockinterviewattempts': 'mock_interview_attempts',
  'MockInterviewQuestions': 'mock_interview_questions',
  'mockinterviewquestions': 'mock_interview_questions',
  'LearningRoadmaps': 'learning_roadmaps',
  'learningroadmaps': 'learning_roadmaps'
};

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all occurrences of the keys in quotes
  for (const [pascal, snake] of Object.entries(tableMap)) {
    // Replace 'PascalCase' or "PascalCase"
    const regex = new RegExp(`['"]${pascal}['"]`, 'g');
    content = content.replace(regex, `'${snake}'`);
  }

  // Double check created_at
  content = content.replace(/createdAt:/g, 'created_at:');
  content = content.replace(/updatedAt:/g, 'updated_at:');

  fs.writeFileSync(filePath, content);
  console.log('Fixed migration: ' + file);
});
