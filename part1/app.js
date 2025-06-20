const express =require('express');
const mysql=require('mysql2/promise');
const app=express();

app.use(express.json());
const dbConfig={
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dogwalks.sql'

};
const port=8080;
let pool;
async function initDb() {
  pool = await mysql.createPool(dbConfig);

  // 初始化資料 — 插入 Users, Dogs, WalkRequests
  await pool.query(`INSERT IGNORE INTO Users (username, email, password_hash, role) VALUES
    ('alice123', 'alice@example.com', 'hashed123', 'owner'),
    ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
    ('carol123', 'carol@example.com', 'hashed789', 'owner'),
    ('daveowner', 'dave@example.com', 'hashed321', 'owner'),
    ('evewalker', 'eve@example.com', 'hashed654', 'walker')
  `);

  await pool.query(`INSERT IGNORE INTO Dogs (owner_id, name, size) VALUES
    ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
    ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
    ((SELECT user_id FROM Users WHERE username = 'daveowner'), 'Rocky', 'large')
  `);

  await pool.query(`INSERT IGNORE INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
    ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
    ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted')
  `);
}

// pool = await mysql.createPool(dbConfig);
// here is routes

// api/dogs
// app.get('/api/dogs',async(req,res)=>)//


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
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// /api/walkrequests/open

app.get('/api/walkrequests/open',async(req, res)=>{
    try{
        const [rows] = await pool.query(`
      SELECT
        WalkRequests.request_id,
        Dogs.name AS dog_name,
        WalkRequests.requested_time,
        WalkRequests.duration_minutes,
        WalkRequests.location,
        Users.username AS owner_username
      FROM WalkRequests
      JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE WalkRequests.status = 'open'
    `);
    res.json(rows);
     } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// /api/walkers/summary


app.get('/api/walkers/summary',async(req,res)=>{
    try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        AVG(r.rating) AS average_rating,
        SUM(CASE WHEN w.status = 'completed' THEN 1 ELSE 0 END) AS completed_walks
      FROM Users u
      LEFT JOIN WalkApplications a ON a.walker_id = u.user_id
      LEFT JOIN WalkRequests w ON a.request_id = w.request_id
      LEFT JOIN WalkRatings r ON r.request_id = w.request_id AND r.walker_id = u.user_id
      WHERE u.role = 'walker'
      GROUP BY u.username
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }



});


app.listen(port, async () => {
  try {
    await initDb();
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
});





















