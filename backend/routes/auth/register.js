const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("✅ register.js loaded — BACKEND_BASE_URL =", process.env.BACKEND_BASE_URL);

const express = require("express");
const router = express.Router();
const db = require("../../models/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const transporter = require("../../utils/mailer");


const FROM_ADDRESS = `"SnowMT Team" <no.reply.at.snow.mountain.tracker@gmail.com>`;

router.post("/", async (req, res) => {
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
    const role = "guest";
    const token = crypto.randomBytes(32).toString("hex");

    await db.query(
      `INSERT INTO users (username, password_hash, email, role, email_verified, email_verification_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, password_hash, email, role, false, token]
    );

    // send them directly to backend for cookie setting
    const backendBase = (process.env.BACKEND_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
    const verificationLink = `${backendBase}/auth/verify-token?token=${token}`;

    console.log("✅ BACKEND_BASE_URL:", process.env.BACKEND_BASE_URL);
    console.log("🔗 Final verification link:", verificationLink);

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: email,
      subject: "✅ Verify your Snow Mountain Tracker account",
      html: `
        <p>Hello <strong>${username}</strong>,</p>
        <p>Thanks for registering! Please verify your account:</p>
        <a href="${verificationLink}" target="_blank">Click to verify</a>
        <p><small>This link expires after use. If you didn’t register, ignore this email.</small></p>
      `
    });

    res.status(201).json({ message: "Registration successful. Please check your email to verify." });
  } catch (err) {
    console.error("🔥 Registration error:", err);
    res.status(500).json({ message: "Internal error", error: err.message });
  }
});

module.exports = router;
