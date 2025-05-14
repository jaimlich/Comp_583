// frontend/pages/api/auth/verify.js

export default function handler(req, res) {
  return res.status(410).json({ message: "Deprecated route. Use /api/auth/verify-token instead." });
}
