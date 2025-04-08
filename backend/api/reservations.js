const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: 7777,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Create a new reservation
exports.createReservation = async (req, res) => {
  const { user_id, resort_id, booking_date } = req.body;

  if (!user_id || !resort_id || !booking_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO bookings (user_id, resort_id, booking_date, status) VALUES (?, ?, ?, ?)',
      [user_id, resort_id, booking_date, 'pending']
    );

    res.json({
      booking_id: result.insertId,
      user_id,
      resort_id,
      booking_date,
      status: 'pending'
    });
  } catch (error) {
    console.error('Reservation creation error:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
};

// ✅ Fetch reservations (optionally filtered by date)
exports.getReservations = async (req, res) => {
  const { date } = req.query;

  try {
    let query = `
      SELECT b.*, u.username AS user_name
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
    `;
    const params = [];

    if (date) {
      query += ' WHERE DATE(b.booking_date) = ?';
      params.push(date);
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
};
