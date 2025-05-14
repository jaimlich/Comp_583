const express = require("express");
const router = express.Router();
const db = require("../../models/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.email_verified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.setHeader("Set-Cookie", [
      `token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=900`,
      `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
    ]);

    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error("💥 Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

module.exports = router;
