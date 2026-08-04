/**
 * Wrap an async route handler to catch errors and forward them to Express error handler.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create an error with a status code.
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Parse skills string into an array.
 */
const parseSkills = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    return skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

module.exports = { asyncHandler, createError, parseSkills };
