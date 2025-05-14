const express = require("express");
const router = express.Router();
const db = require("../../models/database");

router.get("/", async (req, res) => {
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

module.exports = router;
