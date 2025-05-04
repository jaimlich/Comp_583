const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const token = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  console.log("🔐 /me extracted token from headers:", token);

  if (!token) {
    console.warn("❌ /me: No token provided");
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      user: {
        user_id: payload.user_id,
        email: payload.email,
        role: payload.role,
        email_verified: payload.email_verified,
      },
    });
  } catch (err) {
    console.error("❌ /me: Invalid token", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
