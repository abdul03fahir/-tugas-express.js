const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const pool = require('./db');

const app = express();
const port = 3000;

// ===================== MIDDLEWARE =====================

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static folder (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// View engine (Handlebars)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Session untuk login state
app.use(session({
  secret: 'rahasia-login-ini',
  resave: false,
  saveUninitialized: false,
}));

// Middleware untuk inject data user ke semua template
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// ===================== UPLOAD CONFIG =====================
const storage = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ===================== MIDDLEWARE LOGIN =====================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// ===================== ROUTE LOGIN/LOGOUT =====================

// Halaman login (tampilan utama jika belum login)
app.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.render('login'); // langsung tampilkan halaman login jika belum login
  }

  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY id ASC');
    res.render('home', { teams: result.rows });
  } catch (err) {
    console.error('Gagal ambil data tim:', err);
    res.status(500).send('Gagal ambil data tim');
  }
});

// Halaman login khusus
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login');
});

// Proses login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      req.session.user = result.rows[0]; // simpan user ke session
      res.redirect('/');
    } else {
      res.render('login', { error: 'Username atau password salah' });
    }
  } catch (err) {
    console.error('Gagal login:', err);
    res.status(500).send('Gagal login');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ===================== CRUD TEAMS =====================

// Tambah tim (Hanya untuk user login)
app.post('/add-team', requireLogin, upload.single('teamLogo'), async (req, res) => {
  const { teamName, startYear, endYear, teamDesc } = req.body;
  const competitions = Array.isArray(req.body.competitions)
    ? req.body.competitions
    : req.body.competitions
    ? [req.body.competitions]
    : [];

  const logoPath = req.file ? '/images/' + req.file.filename : '/images/default.png';

  try {
    await pool.query(
      `INSERT INTO teams (name, start_year, end_year, description, competitions, logo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [teamName, startYear, endYear, teamDesc, competitions, logoPath]
    );
    res.redirect('/');
  } catch (err) {
    console.error('Gagal tambah tim:', err);
    res.status(500).send('Gagal tambah tim');
  }
});

// Hapus tim (Hanya untuk user login)
app.post('/delete-team/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error('Gagal hapus tim:', err);
    res.status(500).send('Gagal hapus tim');
  }
});

// Detail tim
app.get('/team/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    const team = result.rows[0];
    if (!team) return res.status(404).send('Tim tidak ditemukan');
    res.render('detail', { team });
  } catch (err) {
    console.error('Gagal ambil detail tim:', err);
    res.status(500).send('Gagal ambil detail tim');
  }
});

// ===================== START SERVER =====================
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
