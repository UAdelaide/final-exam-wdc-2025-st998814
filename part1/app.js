const express =require('express');
const mysql=require('mysql2/promise');
const app=express();


const dbConfig={
    host: 'localhost',
    user: 'root',
    password: 'rock8888',
    database: 'dogwalks'

};

let pool;

async function initDb() {
  pool = await mysql.createPool(dbConfig);


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

// here is routes

// api/dogs
app.get('/api/dogs',async(req,res)=>)





