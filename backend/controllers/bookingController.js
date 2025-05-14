const db = require('../models/database');
const qrcode = require('qrcode');
const transporter = require('../utils/mailer'); // ✅ import reusable transporter

exports.createBooking = async (req, res) => {
  const { user_id, lift_id, reservation_date, slot } = req.body;

  if (!user_id || !lift_id || !reservation_date || !slot) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  try {
    const [existing] = await db.query(
      "SELECT * FROM lift_ticket_availability WHERE lift_id = ? AND reservation_date = ?",
      [lift_id, reservation_date]
    );

    let availability = existing[0];

    if (!availability) {
      await db.query(
        "INSERT INTO lift_ticket_availability (lift_id, reservation_date) VALUES (?, ?)",
        [lift_id, reservation_date]
      );

      const [newAvailability] = await db.query(
        "SELECT * FROM lift_ticket_availability WHERE lift_id = ? AND reservation_date = ?",
        [lift_id, reservation_date]
      );

      availability = newAvailability[0];
    }

    const column = slot === "AM" ? "am_tickets_remaining" : "pm_tickets_remaining";
    if (availability[column] <= 0) {
      return res.status(409).json({ message: "No more bookings available for this time slot." });
    }

    await db.query(
      `UPDATE lift_ticket_availability SET ${column} = ${column} - 1 WHERE availability_id = ?`,
      [availability.availability_id]
    );

    const [bookingResult] = await db.query(
      "INSERT INTO bookings (user_id, lift_id, reservation_date, slot_id, status) VALUES (?, ?, ?, ?, ?)",
      [user_id, lift_id, reservation_date, slot === "AM" ? 1 : 2, "confirmed"]
    );

    const booking_id = bookingResult.insertId;
    const qr_text = `Booking ID: ${booking_id} | Date: ${reservation_date} | Slot: ${slot}`;
    const qr_code_url = await qrcode.toDataURL(qr_text);

    await db.query("UPDATE bookings SET qr_code = ? WHERE booking_id = ?", [qr_code_url, booking_id]);

    // ⛷️ Fetch user + lift + slot details
    const [[user]] = await db.query("SELECT name, email FROM users WHERE user_id = ?", [user_id]);
    const [[lift]] = await db.query("SELECT mountain_name FROM lift_tickets WHERE lift_id = ?", [lift_id]);
    const [[slotRow]] = await db.query("SELECT slot_label FROM time_slots WHERE slot_id = ?", [slot === "AM" ? 1 : 2]);

    // ✉️ Send confirmation email
    const mailOptions = {
      from: `"Snow Mountain Tracker" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `⛷️ Your Booking Confirmation - ${lift.mountain_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Booking Confirmed!</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Here are your booking details:</p>
          <ul>
            <li><strong>Mountain:</strong> ${lift.mountain_name}</li>
            <li><strong>Date:</strong> ${reservation_date}</li>
            <li><strong>Time Slot:</strong> ${slotRow.slot_label}</li>
          </ul>
          <p>Present this QR code at the lift gate:</p>
          <img src="${qr_code_url}" alt="Your QR Code" style="width: 200px; margin: 20px 0;" />
          <p>Thank you for using Snow Mountain Tracker!</p>
          <hr>
          <small>This is an automated message. Do not reply.</small>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      booking_id,
      qr_code_url,
      message: "Booking confirmed and email sent!"
    });

  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
