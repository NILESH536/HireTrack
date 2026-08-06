const { Client } = require('pg');

const url = 'postgresql://neondb_owner:npg_0kUWdshY3SDi@ep-frosty-dawn-ap7rmgw2-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log('Connecting to Neon (waiting for wake up)...');
    await client.connect();
    const res = await client.query('SELECT current_database() as db, version() as ver');
    console.log('Success! DB:', res.rows[0].db, 'Ver:', res.rows[0].ver);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.end();
  }
}

testConnection();
