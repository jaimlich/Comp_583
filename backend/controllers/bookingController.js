const db = require('../models/database');
const qrcode = require('qrcode');

exports.createBooking = async (req, res) => {
  const { user_id, lift_id, reservation_date, slot } = req.body;

  if (!user_id || !lift_id || !reservation_date || !slot) {
    return res.status(400).json({ message: 'Missing required booking fields' });
  }

  try {
    const [existingBookings] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE reservation_date = ? AND slot = ? AND lift_id = ?',
      [reservation_date, slot, lift_id]
    );

    const MAX_BOOKINGS = 10;
    if (existingBookings[0].count >= MAX_BOOKINGS) {
      return res.status(409).json({ message: 'Fully booked. Please choose another time.' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, lift_id, reservation_date, slot, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, lift_id, reservation_date, slot, 'confirmed']
    );

    const bookingId = result.insertId;
    const qrPayload = `Booking ID: ${bookingId}, Date: ${reservation_date}, Slot: ${slot}`;
    const qr_code_url = await qrcode.toDataURL(qrPayload);

    res.status(201).json({
      message: 'Booking successful',
      booking_id: bookingId,
      date: reservation_date,
      slot,
      qr_code_url
    });
  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
