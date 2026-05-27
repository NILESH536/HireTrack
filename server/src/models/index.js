const User = require('./User');
const Student = require('./Student');
const Company = require('./Company');
const Drive = require('./Drive');
const Application = require('./Application');
const InterviewSlot = require('./InterviewSlot');
const Notification = require('./Notification');
const ChatMessage = require('./ChatMessage');

// ──────────── User Associations ────────────
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

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

module.exports = {
  User,
  Student,
  Company,
  Drive,
  Application,
  InterviewSlot,
  Notification,
  ChatMessage,
};
