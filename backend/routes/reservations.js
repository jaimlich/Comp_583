const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Check if database is enabled
const DATABASE_ENABLED = process.env.DATABASE_ENABLED === 'false';

// Create a new reservation (booking)
router.post('/', async (req, res) => {
  if (!DATABASE_ENABLED) {
    return res.status(503).json({ error: 'Database is currently disabled' });
  }

  const { name, email, mountain, date } = req.body;
  if (!name || !email || !mountain || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO reservations (name, email, mountain, date) VALUES (?, ?, ?, ?)',
      [name, email, mountain, date]
    );
    res.json({ id: result.insertId, name, email, mountain, date });
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
    let query = 'SELECT * FROM reservations';
    const params = [];
    if (date) {
      query += ' WHERE date = ?';
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
