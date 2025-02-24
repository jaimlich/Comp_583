const db = require('../models/database');

exports.getBookings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM bookings');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
};

exports.createBooking = async (req, res) => {
    const { user_id, resort_id, booking_date, ticket_count } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO bookings (user_id, resort_id, booking_date, ticket_count) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, resort_id, booking_date, ticket_count]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error creating booking' });
    }
};
