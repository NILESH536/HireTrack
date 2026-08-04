const User = require('./User');
const Student = require('./Student');
const Company = require('./Company');
const Drive = require('./Drive');
const Application = require('./Application');
const InterviewSlot = require('./InterviewSlot');
const Notification = require('./Notification');
const ChatMessage = require('./ChatMessage');
const DriveMatch = require('./DriveMatch');
const AIExplanation = require('./AIExplanation');
const Resume = require('./Resume');
const ResumeJDAnalysis = require('./ResumeJDAnalysis');
const PlacementPrediction = require('./PlacementPrediction');
const Assessment = require('./Assessment');
const Question = require('./Question');
const AssessmentAttempt = require('./AssessmentAttempt');
const AssessmentSubmission = require('./AssessmentSubmission');
const WorkflowTemplate = require('./WorkflowTemplate');
const WorkflowStage = require('./WorkflowStage');
const ApplicationTransition = require('./ApplicationTransition');
const AuditLog = require('./AuditLog');
const VerificationRequest = require('./VerificationRequest');
const Document = require('./Document');
const MockInterviewAttempt = require('./MockInterviewAttempt');
const MockInterviewQuestion = require('./MockInterviewQuestion');
const LearningRoadmap = require('./LearningRoadmap');

// ──────────── User Associations ────────────
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ──────────── Student → Resume ────────────
Student.hasMany(Resume, { foreignKey: 'studentId', as: 'resumes' });
Resume.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

User.hasOne(Company, { foreignKey: 'userId', as: 'company' });
Company.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ──────────── Company → Drive ────────────
Company.hasMany(Drive, { foreignKey: 'companyId', as: 'drives' });
Drive.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// ──────────── Student → Application ────────────
Student.hasMany(Application, { foreignKey: 'studentId', as: 'applications' });
Application.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// ──────────── Drive → Application ────────────
Drive.hasMany(Application, { foreignKey: 'driveId', as: 'applications' });
Application.belongsTo(Drive, { foreignKey: 'driveId', as: 'drive' });

// ──────────── Application → InterviewSlot ────────────
Application.hasMany(InterviewSlot, { foreignKey: 'applicationId', as: 'interviewSlots' });
InterviewSlot.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

// ──────────── Student → ChatMessage ────────────
Student.hasMany(ChatMessage, { foreignKey: 'studentId', as: 'chatMessages' });
ChatMessage.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// ──────────── Student → DriveMatch ────────────
Student.hasMany(DriveMatch, { foreignKey: 'studentId', as: 'driveMatches' });
DriveMatch.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// ──────────── Drive → DriveMatch ────────────
Drive.hasMany(DriveMatch, { foreignKey: 'driveId', as: 'driveMatches' });
DriveMatch.belongsTo(Drive, { foreignKey: 'driveId', as: 'drive' });

// ──────────── ResumeJDAnalysis Associations ────────────
Student.hasMany(ResumeJDAnalysis, { foreignKey: 'studentId', as: 'resumeJdAnalyses' });
ResumeJDAnalysis.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Resume.hasMany(ResumeJDAnalysis, { foreignKey: 'resumeId', as: 'jdAnalyses' });
ResumeJDAnalysis.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

Drive.hasMany(ResumeJDAnalysis, { foreignKey: 'driveId', as: 'jdAnalyses' });
ResumeJDAnalysis.belongsTo(Drive, { foreignKey: 'driveId', as: 'drive' });

// ──────────── PlacementPrediction Associations ────────────
Student.hasMany(PlacementPrediction, { foreignKey: 'studentId', as: 'placementPredictions' });
PlacementPrediction.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// ──────────── Assessment Associations ────────────
Company.hasMany(Assessment, { foreignKey: 'companyId', as: 'assessments' });
Assessment.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Assessment.hasMany(Question, { foreignKey: 'assessmentId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });

Drive.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });
Assessment.hasMany(Drive, { foreignKey: 'assessmentId', as: 'drives' });

Student.hasMany(AssessmentAttempt, { foreignKey: 'studentId', as: 'assessmentAttempts' });
AssessmentAttempt.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Assessment.hasMany(AssessmentAttempt, { foreignKey: 'assessmentId', as: 'attempts' });
AssessmentAttempt.belongsTo(Assessment, { foreignKey: 'assessmentId', as: 'assessment' });

Drive.hasMany(AssessmentAttempt, { foreignKey: 'driveId', as: 'assessmentAttempts' });
AssessmentAttempt.belongsTo(Drive, { foreignKey: 'driveId', as: 'drive' });

AssessmentAttempt.hasMany(AssessmentSubmission, { foreignKey: 'attemptId', as: 'submissions', onDelete: 'CASCADE' });
AssessmentSubmission.belongsTo(AssessmentAttempt, { foreignKey: 'attemptId', as: 'attempt' });

Question.hasMany(AssessmentSubmission, { foreignKey: 'questionId', as: 'submissions' });
AssessmentSubmission.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// ──────────── Workflow & Lifecycle Associations ────────────
Company.hasMany(WorkflowTemplate, { foreignKey: 'companyId', as: 'workflowTemplates' });
WorkflowTemplate.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

WorkflowTemplate.hasMany(WorkflowStage, { foreignKey: 'templateId', as: 'stages', onDelete: 'CASCADE' });
WorkflowStage.belongsTo(WorkflowTemplate, { foreignKey: 'templateId', as: 'template' });

WorkflowTemplate.hasMany(Drive, { foreignKey: 'workflowTemplateId', as: 'drives' });
Drive.belongsTo(WorkflowTemplate, { foreignKey: 'workflowTemplateId', as: 'workflowTemplate' });

WorkflowStage.hasMany(Application, { foreignKey: 'currentStageId', as: 'applications' });
Application.belongsTo(WorkflowStage, { foreignKey: 'currentStageId', as: 'currentStage' });

Application.hasMany(ApplicationTransition, { foreignKey: 'applicationId', as: 'transitions', onDelete: 'CASCADE' });
ApplicationTransition.belongsTo(Application, { foreignKey: 'applicationId', as: 'application' });

WorkflowStage.hasMany(ApplicationTransition, { foreignKey: 'fromStageId', as: 'transitionsFrom' });
ApplicationTransition.belongsTo(WorkflowStage, { foreignKey: 'fromStageId', as: 'fromStage' });

WorkflowStage.hasMany(ApplicationTransition, { foreignKey: 'toStageId', as: 'transitionsTo' });
ApplicationTransition.belongsTo(WorkflowStage, { foreignKey: 'toStageId', as: 'toStage' });

User.hasMany(ApplicationTransition, { foreignKey: 'actionBy', as: 'workflowActions' });
ApplicationTransition.belongsTo(User, { foreignKey: 'actionBy', as: 'actionByUser' });

// ──────────── Compliance & Trust Associations ────────────
User.hasMany(AuditLog, { foreignKey: 'actorId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

User.hasMany(VerificationRequest, { foreignKey: 'verifiedBy', as: 'verificationsDone' });
VerificationRequest.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

User.hasMany(Document, { foreignKey: 'verifiedBy', as: 'documentsVerified' });
Document.belongsTo(User, { foreignKey: 'verifiedBy', as: 'documentVerifier' });

// ──────────── Coaching & Learning Associations ────────────
Student.hasMany(MockInterviewAttempt, { foreignKey: 'studentId', as: 'mockInterviews' });
MockInterviewAttempt.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

MockInterviewAttempt.hasMany(MockInterviewQuestion, { foreignKey: 'attemptId', as: 'questions' });
MockInterviewQuestion.belongsTo(MockInterviewAttempt, { foreignKey: 'attemptId', as: 'attempt' });

Student.hasMany(LearningRoadmap, { foreignKey: 'studentId', as: 'roadmaps' });
LearningRoadmap.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  User,
  Student,
  Company,
  Drive,
  Application,
  InterviewSlot,
  Notification,
  ChatMessage,
  DriveMatch,
  AIExplanation,
  Resume,
  ResumeJDAnalysis,
  PlacementPrediction,
  Assessment,
  Question,
  AssessmentAttempt,
  AssessmentSubmission,
  WorkflowTemplate,
  WorkflowStage,
  ApplicationTransition,
  AuditLog,
  VerificationRequest,
  Document,
  MockInterviewAttempt,
  MockInterviewQuestion,
  LearningRoadmap,
};

// ──────────── Polymorphic Associations (AIExplanation) ────────────
DriveMatch.hasOne(AIExplanation, {
  foreignKey: 'entityId',
  constraints: false,
  scope: {
    entityType: 'DRIVE_MATCH',
  },
  as: 'explanation',
});
AIExplanation.belongsTo(DriveMatch, { foreignKey: 'entityId', constraints: false });

Resume.hasOne(AIExplanation, {
  foreignKey: 'entityId',
  constraints: false,
  scope: {
    entityType: 'RESUME_ANALYSIS',
  },
  as: 'explanation',
});
AIExplanation.belongsTo(Resume, { foreignKey: 'entityId', constraints: false });

ResumeJDAnalysis.hasOne(AIExplanation, {
  foreignKey: 'entityId',
  constraints: false,
  scope: {
    entityType: 'RESUME_JD_ANALYSIS',
  },
  as: 'explanation',
});
AIExplanation.belongsTo(ResumeJDAnalysis, { foreignKey: 'entityId', constraints: false });

PlacementPrediction.hasOne(AIExplanation, {
  foreignKey: 'entityId',
  constraints: false,
  scope: {
    entityType: 'PLACEMENT_PREDICTION',
  },
  as: 'explanation',
});
AIExplanation.belongsTo(PlacementPrediction, { foreignKey: 'entityId', constraints: false });
