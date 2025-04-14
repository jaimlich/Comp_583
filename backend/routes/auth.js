const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // ✅ added
const transporter = require('../utils/mailer');

// Register route (send verification)
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const username = email.split('@')[0];
    const password_hash = await bcrypt.hash(password, 10);
    const role = 'guest';
    const token = crypto.randomBytes(32).toString('hex');

    const [result] = await db.query(
      'INSERT INTO users (username, password_hash, email, role, email_verified, email_verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password_hash, email, role, false, token]
    );

    const verificationLink = `http://localhost:3000/verify?token=${token}`;

    await transporter.sendMail({
      from: '"Snow Mountain Tracker" <no.reply.at.snow.mountain.tracker@gmail.com>',
      to: email,
      subject: "✅ Verify Your Snow Mountain Tracker Account",
      html: `
        <p>Hello <strong>${username}</strong>,</p>
        <p>Thanks for registering! Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}" target="_blank">Verify my account</a>
        <br><br>
        <small>This link will expire after your first verification. If you didn’t sign up, ignore this email.</small>
      `
    });

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Email verification route
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid verification link");

  try {
    const [rows] = await db.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE email_verification_token = ?",
      [token]
    );

    if (rows.affectedRows === 0) {
      return res.status(400).send("Verification link expired or already used.");
    }

    res.send("✅ Email verified! You may now log in.");
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).send("Error verifying email");
  }
});

// Login route (now returns JWT + restricts unverified users)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        email_verified: user.email_verified
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: 'Login successful',
      token, // ✅ return token to frontend
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Resend verification route
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.email_verified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.query(
      "UPDATE users SET email_verification_token = ? WHERE user_id = ?",
      [token, user.user_id]
    );

    const verificationLink = `http://localhost:3000/verify?token=${token}`;
    await transporter.sendMail({
      from: '"Snow Mountain Tracker" <no.reply.at.snow.mountain.tracker@gmail.com>',
      to: email,
      subject: "📧 Resend Verification - Snow Mountain Tracker",
      html: `
        <p>Hello <strong>${user.username}</strong>,</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Click here to verify</a>
      `
    });

    res.json({ message: "Verification email resent!" });

  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Failed to resend verification email." });
  }
});

module.exports = router;
