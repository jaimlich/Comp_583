const express = require("express");
const router = express.Router();
const db = require("../../models/database");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { token } = req.query;
  console.log("🔍 Hit /api/auth/verify-token with token:", token);

  if (!token) {
    console.warn("❌ No token provided");
    return res.status(400).json({ message: "Missing token" });
  }

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE BINARY email_verification_token = ?",
      [token]
    );

    if (!users || users.length === 0) {
      console.warn("❌ No user found for token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = users[0];
    console.log("✅ Found user:", user.user_id, user.email);

    const [result] = await db.query(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE user_id = ?",
      [user.user_id]
    );

    console.log("✅ UPDATE result:", result);

    if (result.affectedRows === 0) {
      console.error("❌ DB update failed — token may already be null or email_verified already true");
      return res.status(500).json({ message: "User could not be verified" });
    }

    const payload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      email_verified: true,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isDev = process.env.NODE_ENV !== "production";

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 15 * 60 * 1000
    };
    
    res.cookie("token", accessToken, options);
    res.cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 });    

    // res.cookie("token", accessToken, {
    //   httpOnly: true,
    //   secure: !isDev ? true : false,
    //   sameSite: isDev ? "Lax" : "Strict",
    //   path: "/",
    //   maxAge: 15 * 60 * 1000,
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: !isDev ? true : false,
    //   sameSite: isDev ? "Lax" : "Strict",
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.redirect(`${process.env.FRONTEND_BASE_URL}/verify?status=success`);
  } catch (err) {
    console.error("❌ Fatal error in verify-token:", {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
});

module.exports = router;
