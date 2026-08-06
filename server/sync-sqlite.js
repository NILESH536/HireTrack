require('dotenv').config();
const { sequelize } = require('./src/config/database');
const models = require('./src/models');

async function syncDB() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Synchronizing tables...');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDB();
