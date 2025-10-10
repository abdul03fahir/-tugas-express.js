// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',        // user PostgreSQL kamu
  host: 'localhost',       // host, biasanya localhost
  database: 'dbbola',      // nama database kamu di pgAdmin
  password: 'Super123@!',  // ganti dengan password PostgreSQL
  port: 5432,              // port default PostgreSQL
});

pool.connect()
  .then(() => console.log('Berhasil konek ke PostgreSQL'))
  .catch(err => console.error('Gagal konek ke database:', err));

module.exports = pool;
