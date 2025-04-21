// frontend/pages/api/auth/verify.js
import axios from "axios";

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  try {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await axios.get(`${backend}/api/auth/verify?token=${token}`);
    res.status(200).send(response.data || "Verified");
  } catch (error) {
    const status = error.response?.status || 500;
    const msg = error.response?.data || "Verification failed.";
    res.status(status).send(msg);
  }
}
