const express = require('express');
const path = require('path');
require('dotenv').config();
const pool = require('./models/db');


const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');


app.use((req, res, next) => {
    req.db = pool;
    next();
});

app.use(session({
    secret: "y68n8ubhyvgtfbjuhygf",
    resave: false,
    saveUninitialized: false
}));



app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);




app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        Dogs.name AS dog_name,
        Dogs.size,
        Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);

     // fetch random dog photo
     const dogsWithPhoto = await Promise.all(rows.map(async (dog) => {
       let photo_url = '';
       try {
         const response = await fetch('https://dog.ceo/api/breeds/image/random');
         const data = await response.json();
        photo_url = data.message;
       } catch (err) {
        console.error('Failed to load img:', err);
           photo_url = ''; // fallback
      }
      return { ...dog, photo_url };


}));

// create api to fectch owner's dog
app.get('/api/owner/dogs', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'owner') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const [rows] = await req.db.query(`
            SELECT dog_id, name
            FROM Dogs
            WHERE owner_id = ?
        `, [req.session.user.id]);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = app;


