const { neon } = require('@neondatabase/serverless');

const url = 'postgresql://neondb_owner:npg_0kUWdshY3SDi@ep-frosty-dawn-ap7rmgw2-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testHttpConnection() {
  try {
    console.log('Connecting to Neon via HTTP...');
    const sql = neon(url);
    const rows = await sql`SELECT version()`;
    console.log('Success! version:', rows[0].version);
  } catch (err) {
    console.error('HTTP Connection failed:', err);
  }
}

testHttpConnection();
