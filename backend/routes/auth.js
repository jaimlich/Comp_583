// backend/routes/auth.js

const express = require("express");
const router = express.Router();
const db = require("../models/database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/mailer");

const FROM_ADDRESS = `"SnowMT Team" <no.reply.at.snow.mountain.tracker@gmail.com>`;

function isJsonRequest(req) {
  return req.headers.accept?.includes("application/json");
}

// register
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
    const role = "guest";
    const token = crypto.randomBytes(32).toString("hex");

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

// login
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

// email verification
// Handle GET /verify — used by email link
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email_verification_token = ?", [token]);
    const user = users[0];

    if (!user) return res.status(400).send("Invalid or expired token.");

    if (user.email_verified) return res.redirect("/verify?status=success");

    await db.query("UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE user_id = ?", [user.user_id]);

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

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

    res.redirect("/verify?status=success");
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).send("Error verifying email.");
  }
});

// Handle GET /verify-token — called by frontend API to fetch JSON
router.get("/verify-token", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing token" });

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email_verification_token = ?", [token]);
    const user = users[0];

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    if (user.email_verified) {
      return res.status(200).json({ message: "Already verified", user });
    }

    await db.query("UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE user_id = ?", [user.user_id]);

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

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

    res.status(200).json({ message: "Email verified", user: payload });
  } catch (err) {
    console.error("Verification API error:", err);
    res.status(500).json({ message: "Error verifying token" });
  }
});

// me
const authMiddleware = require("../middleware/auth");
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { user_id, email, role } = req.user;
    res.json({ user: { user_id, email, role } });
  } catch (err) {
    res.status(500).json({ message: "Failed to get user", error: err.message });
  }
});

// check-email (for real-time duplicate check)
router.get("/check-email", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ exists: false });

  try {
    const [rows] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error("Email check error:", err);
    res.status(500).json({ exists: false });
  }
});

// logout
router.post("/logout", (req, res) => {
  res.setHeader("Set-Cookie", [
    "token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict",
    "refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict"
  ]);
  res.status(200).json({ message: "Logged out" });
});

// resend
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.email_verified) return res.status(400).json({ message: "Email already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    await db.query("UPDATE users SET email_verification_token = ? WHERE user_id = ?", [token, user.user_id]);

    const verificationLink = `http://localhost:3000/verify?token=${token}`;
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
    res.status(500).json({ message: "Resend error", error: err.message });
  }
});

// refresh
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign({
      user_id: payload.user_id,
      email: payload.email,
      role: payload.role
    }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.setHeader("Set-Cookie", `token=${accessToken}; Path=/; HttpOnly; Max-Age=900; SameSite=Strict`);
    res.status(200).json({ message: "Refreshed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

module.exports = router;
