const {Pool}=require('pg');

const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use SSL for production (Render/Railway), but not for local
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});