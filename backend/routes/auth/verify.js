const express = require("express");
const router = express.Router();
const db = require("../../models/database");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { token } = req.query;
  console.log("🔍 Hit /verify?token=", token);

  if (!token) return res.status(400).send("Missing token");

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE BINARY email_verification_token = ?",
      [token]
    );

    if (!users || users.length === 0) {
      console.warn("❌ No user found for token:", token);
      return res.status(400).send("Invalid or expired token");
    }

    const user = users[0];
    console.log("✅ Found user:", user.user_id, user.email);

    const [result] = await db.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE user_id = ?",
      [user.user_id]
    );

    console.log("✅ UPDATE result:", result);

    if (result.affectedRows === 0) {
      console.error("❌ DB update failed — user not modified");
      return res.status(500).json({ message: "Failed to verify user" });
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m"
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    const isDev = process.env.NODE_ENV !== "production";

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: !isDev ? true : false,
      sameSite: isDev ? "Lax" : "Strict",
      path: "/",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: !isDev ? true : false,
      sameSite: isDev ? "Lax" : "Strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: "Email verified" });
  } catch (err) {
    console.error("❌ verify-token crash:", {
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
});

module.exports = router;
