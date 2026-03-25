
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  // This will pull the long string you found in the Render Dashboard
  connectionString: process.env.DATABASE_URL,
  // Render/Cloud DBs usually require SSL to connect
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;