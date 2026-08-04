require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // Sync models (use migrations in production)
    await sequelize.sync();
    logger.info('✅ Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
