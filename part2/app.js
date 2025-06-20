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

// handle login
app.post('/login',async(req,res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM Users WHERE username = ? AND password_hash = ?`,
            [username, password]
        );
        if (rows.length > 0) {
            req.session.user = {
                id: rows[0].user_id,
                username: rows[0].username,
                role: rows[0].role
            };
            if (rows[0].role === 'owner') {
                res.redirect('/owner-dashboard.html');
            } else if (rows[0].role === 'walker'){
                res.redirect('/walker-dashboard.html');
            } else{
                res.redirect('/');
            }
        } else {

            res.send('Login failed. Invalid username or password.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

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

// routes for 0wner-dashboard


module.exports = app;



