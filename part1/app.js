const express =require('express');
const mysql=require('mysql2/promise');
const app=express();


const dbConfig={
    host: 'localhost',
    user: 'root',
    password: 'rock8888',
    database: 'dogwalks'

};




// here is routes

// api/dogs
//app.get('/api/dogs',async(req,res)=>)//


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




// 

















