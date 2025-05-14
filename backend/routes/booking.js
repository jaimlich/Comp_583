// backend/routes/booking.js
const express = require("express");
const router = express.Router();
const db = require("../models/database");
const bookingController = require("../controllers/bookingController");

// POST /api/booking — create booking and prevent duplicates
router.post("/", async (req, res) => {
  const { user_id, lift_id, reservation_date, slot } = req.body;

  if (!user_id || !lift_id || !reservation_date || !slot) {
    return res.status(400).json({ message: "Missing required booking fields." });
  }

  try {
    // Check for duplicate
    const [existing] = await db.query(
      `SELECT * FROM bookings 
       WHERE user_id = ? AND lift_id = ? AND reservation_date = ? AND slot = ? AND canceled_at IS NULL`,
      [user_id, lift_id, reservation_date, slot]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "You’ve already booked this slot." });
    }

    // Insert booking
    const [result] = await db.query(
      `INSERT INTO bookings (user_id, lift_id, reservation_date, slot, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [user_id, lift_id, reservation_date, slot]
    );

    // Generate QR stub
    const qr_code = `QR-${user_id}-${lift_id}-${slot}-${reservation_date.replace(/-/g, "")}`;

    res.status(201).json({ qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=${qr_code}` });
  } catch (err) {
    console.error("Booking insert error:", err.message);
    res.status(500).json({ message: "Booking failed." });
  }
});

// GET /api/booking/availability
router.get("/availability", async (req, res) => {
  const { lift_id, reservation_date } = req.query;
  const MAX = 100;

  if (!lift_id || !reservation_date) {
    return res.status(400).json({ message: "Missing lift_id or reservation_date" });
  }

  try {
    const [rows] = await db.query(
      `SELECT slot, COUNT(*) as total
       FROM bookings
       WHERE lift_id = ? AND reservation_date = ? AND canceled_at IS NULL
       GROUP BY slot`,
      [lift_id, reservation_date]
    );

    const slotCounts = { AM: 0, PM: 0 };
    rows.forEach(r => slotCounts[r.slot] = r.total);

    const availability = {
      AM: Math.max(0, MAX - (slotCounts["AM"] || 0)),
      PM: Math.max(0, MAX - (slotCounts["PM"] || 0))
    };

    res.json(availability);
  } catch (err) {
    console.error("Availability check error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/booking/user/:user_id
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT booking_id, reservation_date, slot, qr_code, lift_id
       FROM bookings 
       WHERE user_id = ? AND canceled_at IS NULL
       ORDER BY reservation_date ASC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("User bookings fetch failed:", err.message);
    res.status(500).json({ message: "Could not fetch bookings" });
  }
});

// POST /api/booking/cancel/:booking_id
router.post("/cancel/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  try {
    await db.query(
      `UPDATE bookings SET canceled_at = NOW() WHERE booking_id = ?`,
      [booking_id]
    );
    res.json({ message: "Booking cancelled." });
  } catch (err) {
    console.error("Cancel failed:", err.message);
    res.status(500).json({ message: "Failed to cancel." });
  }
});

module.exports = router;
