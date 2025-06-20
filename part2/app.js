const express = require('express');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
// connect DB
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
};

let pool;

async function initDb() {
    pool = await mysql.createPool(dbConfig);
    console.log('DB connected');
}

initDb();
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use(session({
    secret: "y68n8ubhyvgtfbjuhygf",
    resave: false,
    saveUninitialized: false
}));


// handle logout
app.get('/logout',(req,res) => {
    req.session.destroy((err) => { // session destory
        if (err) {
            console.error(err);
            return res.status(500).send('Could not log out');
        }
        res.clearCookie('connect.sid');
        res.redirect('/index.html'); // redirect to homepage
    });
});




app.get('/api/owner/dogs', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'owner') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const [rows] = await pool.query(`
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



