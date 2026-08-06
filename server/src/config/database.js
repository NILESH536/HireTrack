const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// Support Neon/Render DATABASE_URL or individual DB_* vars
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      hooks: {
        beforeConnect: async (config) => {
          if (config.host && config.host.includes('neon.tech')) {
            try {
              const ips = await require('dns').promises.resolve4(config.host);
              if (ips.length > 0) {
                config.dialectOptions = config.dialectOptions || {};
                config.dialectOptions.ssl = config.dialectOptions.ssl || {};
                config.dialectOptions.ssl.servername = config.host;
                config.host = ips[0];
              }
            } catch (e) {
              // Ignore DNS resolution errors and let pg try
            }
          }
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'hiretrack',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'postgres',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: {
          max: isProduction ? 20 : 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: isProduction ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      }
    );

module.exports = { sequelize, Sequelize };
