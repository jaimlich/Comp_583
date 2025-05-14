const express = require("express");
const router = express.Router();
const db = require("../../models/database");
const crypto = require("crypto");
const transporter = require("../../utils/mailer");

const FROM_ADDRESS = `"SnowMT Team" <no.reply.at.snow.mountain.tracker@gmail.com>`;

router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.email_verified) return res.status(400).json({ message: "Email already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    await db.query("UPDATE users SET email_verification_token = ? WHERE user_id = ?", [token, user.user_id]);

    const verificationLink = `${process.env.FRONTEND_BASE_URL}/verify?token=${token}`;
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "🔁 Resend Verification",
      html: `
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Click below to verify your email:</p>
        <a href="${verificationLink}">Verify your account</a>
      `
    });

    res.json({ message: "Verification email resent." });

  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Resend error", error: err.message });
  }
});

module.exports = router;
