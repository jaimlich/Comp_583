const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
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
