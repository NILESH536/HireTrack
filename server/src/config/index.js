require('dotenv').config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_for_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'GEMINI',
    geminiApiKey: process.env.GEMINI_API_KEY,
    claudeApiKey: process.env.CLAUDE_API_KEY,
  },
};

module.exports = config;
