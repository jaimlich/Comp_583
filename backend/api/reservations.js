const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

exports.createReservation = async (req, res) => {
  const { name, email, mountain, date } = req.body;
  if (!name || !email || !mountain || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO reservations (name, email, mountain, date) VALUES (?, ?, ?, ?)',
      [name, email, mountain, date]
    );
    res.json({ id: result.insertId, name, email, mountain, date });
  } catch (error) {
    console.error('Reservation creation error:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
};

exports.getReservations = async (req, res) => {
  const { date } = req.query;
  try {
    let query = 'SELECT * FROM reservations';
    const params = [];
    if (date) {
      query += ' WHERE date = ?';
      params.push(date);
    }
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
};
