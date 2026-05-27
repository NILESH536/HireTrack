const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hirectrack',
  process.env.DB_USER || 'hirectrack',
  process.env.DB_PASSWORD || 'hirectrack_secret',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  }
);

module.exports = { sequelize, Sequelize };
