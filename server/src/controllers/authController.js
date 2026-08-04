const { User, Student, Company } = require('../models');
const { generateToken } = require('../utils/jwt');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../utils/helpers');
const logger = require('../utils/logger');
const responseBuilder = require('../utils/responseBuilder');
const { ConflictError, UnauthorizedError, ForbiddenError } = require('../utils/errors');

exports.register = asyncHandler(async (req, res) => {
  const { email, password, name, role, branch, cgpa, skills, careerGoal, industry, website, description } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Create user — students are auto-approved
  const user = await User.create({
    email,
    password,
    name,
    role,
    approved: role === 'STUDENT' || role === 'ADMIN',
  });

  // Create role-specific profile
  if (role === 'STUDENT') {
    await Student.create({
      userId: user.id,
      branch: branch || 'Computer Science',
      cgpa: cgpa || 0,
      skills: skills || [],
      careerGoal: careerGoal || '',
    });
  } else if (role === 'COMPANY') {
    await Company.create({
      userId: user.id,
      industry: industry || '',
      website: website || '',
      description: description || '',
    });
  }

  const token = generateToken(user);

  // Send welcome email
  emailService.sendWelcomeEmail(user);

  logger.info(`New ${role} registered: ${email}`);

  const message = role === 'COMPANY' 
    ? 'Registration successful. Pending admin approval.' 
    : 'Registration successful';

  return responseBuilder.success(res, { token, user: user.toJSON() }, message, 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check company approval
  if (user.role === 'COMPANY' && !user.approved) {
    throw new ForbiddenError('Your company account is pending admin approval. Please wait for confirmation.');
  }

  const token = generateToken(user);

  logger.info(`User logged in: ${email} (${user.role})`);

  return responseBuilder.success(res, { token, user: user.toJSON() }, 'Login successful');
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { model: Student, as: 'student' },
      { model: Company, as: 'company' },
    ],
  });

  return responseBuilder.success(res, { user: user.toJSON() }, 'User fetched successfully');
});
