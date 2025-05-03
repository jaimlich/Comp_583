// frontend/pages/api/auth/me.js
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
