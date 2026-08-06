const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window`
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 AI requests per minute
  message: { error: 'Too many AI requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  aiLimiter
};
