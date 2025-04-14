const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// POST /api/booking
router.post("/", bookingController.createBooking);

// GET /api/booking/availability
router.get("/availability", async (req, res) => {
  const { lift_id, reservation_date } = req.query;

  if (!lift_id || !reservation_date) {
    return res.status(400).json({ message: "Missing lift_id or reservation_date" });
  }

  try {
    const [rows] = await require("../models/database").query(
      "SELECT am_tickets_remaining, pm_tickets_remaining FROM lift_ticket_availability WHERE lift_id = ? AND reservation_date = ?",
      [lift_id, reservation_date]
    );

    let result = { AM: true, PM: true };

    if (rows.length > 0) {
      result = {
        AM: rows[0].am_tickets_remaining > 0,
        PM: rows[0].pm_tickets_remaining > 0
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Availability check error:", error.message);
    res.status(500).json({ message: "Internal error checking availability" });
  }
});

// GET /api/booking/user/:user_id
router.get("/user/:user_id", async (req, res) => {
    const { user_id } = req.params;
    try {
      const [rows] = await require("../models/database").query(
        `SELECT b.booking_id, b.reservation_date, b.slot_id, b.qr_code,
                l.mountain_name, t.slot_label
         FROM bookings b
         JOIN lift_tickets l ON b.lift_id = l.lift_id
         JOIN time_slots t ON b.slot_id = t.slot_id
         WHERE b.user_id = ? AND b.reservation_date >= CURDATE()
         ORDER BY b.reservation_date ASC`,
        [user_id]
      );
      res.json(rows);
    } catch (err) {
      console.error("User booking fetch error:", err.message);
      res.status(500).json({ message: "Failed to fetch user bookings" });
    }
  });
  

module.exports = router;
