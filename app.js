const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Simulasi database
let teams = [
  {
    id: 1,
    name: "PERSIJA JAKARTA",
    startYear: "1928",
    endYear: "",
    desc: "Persija Jakarta adalah klub sepak bola profesional dari Jakarta yang didirikan pada 28 November 1928, dikenal sebagai Macan Kemayoran, dan memiliki basis suporter The Jakmania.",
    competitions: ["Liga 1", "Liga Champions"],
    logo: "/images/persija.jpg"
  },
  {
    id: 2,
    name: "PERSIB BANDUNG",
    startYear: "1919",
    endYear: "",
    desc: "Persib Bandung adalah klub sepak bola profesional Indonesia dari Bandung, Jawa Barat, yang didirikan pada 14 Maret 1933. Julukannya Maung Bandung & Pangeran Biru, dengan basis fans Bobotoh.",
    competitions: ["Liga 1"],
    logo: "/images/persib.jpg"
  }
];

// Storage upload logo
const storage = multer.diskStorage({
  destination: './public/images',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Halaman utama
app.get('/', (req, res) => {
  res.render('home', { teams });
});

// Tambah tim
app.post('/add-team', upload.single('teamLogo'), (req, res) => {
  const { teamName, startYear, endYear, teamDesc } = req.body;
  const competitions = Array.isArray(req.body.competitions)
    ? req.body.competitions
    : req.body.competitions ? [req.body.competitions] : [];

  let logoPath = '';
  if (req.file) {
    logoPath = '/images/' + req.file.filename;
  }

  const newTeam = {
    id: Date.now(),
    name: teamName,
    startYear,
    endYear,
    desc: teamDesc,
    competitions,
    logo: logoPath || '/images/default.png'
  };

  teams.push(newTeam);
  res.redirect('/');
});

// Hapus tim
app.post('/delete-team/:id', (req, res) => {
  const { id } = req.params;
  teams = teams.filter(team => team.id != id);
  res.redirect('/');
});

// Detail tim
app.get('/team/:id', (req, res) => {
  const team = teams.find(t => t.id == req.params.id);
  if (!team) return res.status(404).send('Tim tidak ditemukan');
  res.render('detail', { team });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
