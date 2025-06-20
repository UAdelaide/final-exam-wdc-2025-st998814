const express = require('express');
const path = require('path');
require('dotenv').config();


const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');






app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);
app.use(session({
    secret: "y68n8ubhyvgtfbjuhygf",
    resave: false,
    saveUninitialized: false
}));





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



