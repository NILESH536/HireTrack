const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return 400 on failure.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['STUDENT', 'COMPANY']).withMessage('Role must be STUDENT or COMPANY'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const driveRules = [
  body('jobRole').notEmpty().withMessage('Job role is required'),
  body('jobDescription').notEmpty().withMessage('Job description is required'),
  body('salaryLpa').isFloat({ min: 0 }).withMessage('Valid salary required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['FULL_TIME', 'INTERNSHIP', 'BOTH']).withMessage('Invalid job type'),
  body('minCgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0-10'),
  body('eligibleBranches').isArray({ min: 1 }).withMessage('At least one branch required'),
  body('applicationDeadline').isISO8601().withMessage('Valid deadline date required'),
  body('driveDate').isISO8601().withMessage('Valid drive date required'),
];

const chatRules = [
  body('message').notEmpty().withMessage('Message is required'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  driveRules,
  chatRules,
};
