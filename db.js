// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // user PostgreSQL kamu
  host: 'localhost',       // host, biasanya localhost
  database: 'dbbola',      // nama database kamu di pgAdmin
  password: 'Super123@!',  // ganti dengan password PostgreSQL
  port: 5432,              // port default PostgreSQL
});

module.exports = pool;
