const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const companyRoutes = require('./routes/company');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const matchRoutes = require('./routes/match');
const assessmentRoutes = require('./routes/assessment');
const analyticsRoutes = require('./routes/analytics');
const workflowRoutes = require('./routes/workflow');
const complianceRoutes = require('./routes/compliance');
const coachingRoutes = require('./routes/coaching');

const app = express();

// ──────────── Middleware Stack ────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
      .split(',').map(s => s.trim());
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development, restrict in production if needed
    }
  },
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ──────────── Routes ────────────
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/coaching', coachingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ──────────── Error Handling ────────────
const responseBuilder = require('./utils/responseBuilder');
const { NotFoundError } = require('./utils/errors');
const logger = require('./utils/logger');

// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});


// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    logger.error(`[${req.method}] ${req.originalUrl} >> StatusCode:: ${statusCode}, Message:: ${err.message}`);
    if (statusCode === 500) {
      logger.error(err.stack);
    }
  }

  // Include stack trace only in development for 500 errors or non-operational errors
  const errors = (process.env.NODE_ENV === 'development' && !err.isOperational) ? { stack: err.stack } : null;

  return responseBuilder.error(res, message, statusCode, errors);
});



// [EPIC 11] Initialize Automation Engine
const AutomationEngine = require('./modules/notifications/AutomationEngine');
AutomationEngine.initialize();

module.exports = app;
