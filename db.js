// db.js
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // tu URL de render
  ssl: { rejectUnauthorized: false }, // necesario en Render
});

module.exports = pool;
