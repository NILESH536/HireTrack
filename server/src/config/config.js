require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Shared SSL options for Neon/production
const sslOptions = { ssl: { require: true, rejectUnauthorized: false } };

// If DATABASE_URL is set (Neon/Render), use it for all environments
const databaseUrl = process.env.DATABASE_URL;

module.exports = {
  development: databaseUrl
    ? { url: databaseUrl, dialect: 'postgres', dialectOptions: sslOptions }
    : {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'hiretrack',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
      },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hiretrack_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
  },
  production: databaseUrl
    ? { url: databaseUrl, dialect: 'postgres', dialectOptions: sslOptions }
    : {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'postgres',
        dialectOptions: sslOptions,
      },
};
