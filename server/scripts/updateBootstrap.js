const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/migrations/20260804110000-bootstrap-sequelizeMeta-and-cleanup.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace tablename = 'Users'
content = content.replace(/tablename = 'Users'/g, "tablename = 'users'");

// Replace ALTER TABLE "Users"
content = content.replace(/ALTER TABLE "Users"/g, 'ALTER TABLE users');

// Replace performance indexes tables array
content = content.replace(/table: 'Applications'/g, "table: 'applications'");
content = content.replace(/table: 'DriveMatches'/g, "table: 'drive_matches'");
content = content.replace(/table: 'InterviewSlots'/g, "table: 'interview_slots'");
content = content.replace(/table: 'MockInterviewAttempts'/g, "table: 'mock_interview_attempts'");
content = content.replace(/table: 'AssessmentAttempts'/g, "table: 'assessment_attempts'");
content = content.replace(/table: 'Resumes'/g, "table: 'resumes'");
content = content.replace(/table: 'Notifications'/g, "table: 'notifications'");
content = content.replace(/table: 'PlacementPredictions'/g, "table: 'placement_predictions'");
content = content.replace(/table: 'LearningRoadmaps'/g, "table: 'learning_roadmaps'");
content = content.replace(/table: 'AIExplanations'/g, "table: 'ai_explanations'");

content = content.replace(/\['Applications',/g, "['applications',");
content = content.replace(/\['DriveMatches',/g, "['drive_matches',");
content = content.replace(/\['InterviewSlots',/g, "['interview_slots',");
content = content.replace(/\['MockInterviewAttempts',/g, "['mock_interview_attempts',");
content = content.replace(/\['AssessmentAttempts',/g, "['assessment_attempts',");
content = content.replace(/\['Resumes',/g, "['resumes',");
content = content.replace(/\['Notifications',/g, "['notifications',");
content = content.replace(/\['PlacementPredictions',/g, "['placement_predictions',");
content = content.replace(/\['LearningRoadmaps',/g, "['learning_roadmaps',");
content = content.replace(/\['AIExplanations',/g, "['ai_explanations',");

fs.writeFileSync(filePath, content);
console.log('Updated bootstrap migration');
