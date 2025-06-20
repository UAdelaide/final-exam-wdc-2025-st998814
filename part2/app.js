const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));

app.post('/login',async(req,res)=>{
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
                res.redirect('/owner-dashboard');
            } else if (rows[0].role === 'walker'){
                res.redirect('/walker-dashboard');
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
// Export the app instead of listening here
module.exports = app;