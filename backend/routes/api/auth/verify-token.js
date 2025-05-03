//backend/routes/api/auth/verify-token.js
const express = require("express");
const router = express.Router();
const db = require("../../../models/database");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing token" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email_verification_token = ?",
      [token]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (user.email_verified) {
      return res.status(200).json({ message: "Already verified" });
    }

    await db.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE user_id = ?",
      [user.user_id]
    );

    const accessToken = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const refreshToken = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Email verified", user: { email: user.email } });
  } catch (err) {
    console.error("Email verify-token error:", err);
    res.status(500).json({ message: "Internal error verifying token" });
  }
});

module.exports = router;
