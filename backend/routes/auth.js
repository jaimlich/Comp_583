// backend/routes/auth.js

const express = require("express");
const router = express.Router();
const db = require("../models/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");

// ✅ Friendly sender display name
const FROM_ADDRESS = `"SnowMT Team" <no.reply.at.snow.mountain.tracker@gmail.com>`;

// 🔐 Register
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log("📨 Register attempt:", req.body);

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const username = email.split("@")[0];
    const password_hash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");
    const role = "guest";

    await db.query(`
      INSERT INTO users (username, password_hash, email, role, email_verified, email_verification_token)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, email, role, false, token]
    );

    const verificationLink = `http://localhost:3000/verify?token=${token}`;

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "✅ Verify your Snow Mountain Tracker account",
      html: `
        <p>Hello <strong>${username}</strong>,</p>
        <p>Thanks for registering! Please verify your account below:</p>
        <a href="${verificationLink}" target="_blank">Click to verify</a>
        <br/>
        <small>This link expires after one use. If you didn’t register, ignore this email.</small>
      `
    });

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account."
    });

  } catch (err) {
    console.error("🔥 Registration error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      stack: err.stack
    });
  }
});

// ✅ Email verification
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid verification token");

  try {
    const [result] = await db.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email_verification_token = ?",
      [token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).send("Token expired or already used.");
    }

    res.send("✅ Email verified! You may now log in.");
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).send("Error verifying account");
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
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

    const token = jwt.sign({
      user_id: user.user_id,
      email: user.email,
      email_verified: user.email_verified
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.username
      }
    });

  } catch (err) {
    console.error("💥 Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Resend verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.email_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.query(
      "UPDATE users SET email_verification_token = ? WHERE user_id = ?",
      [token, user.user_id]
    );

    const link = `http://localhost:3000/verify?token=${token}`;

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "🔁 Resend Verification - Snow Mountain Tracker",
      html: `
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Please verify your email by clicking below:</p>
        <a href="${link}" target="_blank">Verify your account</a>
      `
    });

    res.json({ message: "Verification email resent." });

  } catch (err) {
    console.error("📫 Resend error:", err);
    res.status(500).json({ message: "Failed to resend verification email." });
  }
});

module.exports = router;
