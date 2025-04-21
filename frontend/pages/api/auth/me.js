// frontend/pages/api/auth/me.js
import jwt from "jsonwebtoken";
import Cookies from "cookies";

export default function handler(req, res) {
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}
