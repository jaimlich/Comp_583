const express = require('express');
const router = express.Router();
const db = require('../models/database');

const DATABASE_ENABLED = process.env.DATABASE_ENABLED === 'true';

// Create a new reservation (booking)
router.post('/', async (req, res) => {
  if (!DATABASE_ENABLED) {
    return res.status(503).json({ error: 'Database is currently disabled' });
  }

  const { lift_id, reservation_date, slot_id, qr_code } = req.body;

  if (!lift_id || !reservation_date || !slot_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO bookings (lift_id, reservation_date, slot_id, qr_code, status) VALUES (?, ?, ?, ?, ?)',
      [lift_id, reservation_date, slot_id, qr_code || null, 'pending']
    );

    res.json({
      booking_id: result.insertId,
      lift_id,
      reservation_date,
      slot_id,
      qr_code: qr_code || null,
      status: 'pending',
    });
  } catch (error) {
    console.error('Reservation creation error:', error.message);
    res.status(500).json({ error: 'Error creating reservation' });
  }
});

// Get reservations (optionally by date)
router.get('/', async (req, res) => {
  if (!DATABASE_ENABLED) {
    return res.status(503).json({ error: 'Database is currently disabled' });
  }

  const { date } = req.query;

  try {
    let query = 'SELECT * FROM bookings';
    const params = [];

    if (date) {
      query += ' WHERE DATE(reservation_date) = ?';
      params.push(date);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    res.status(500).json({ error: 'Error fetching reservations' });
  }
});

module.exports = router;
