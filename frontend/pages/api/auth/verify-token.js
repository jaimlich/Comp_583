// frontend/pages/api/auth/verify-token.js
import axios from "axios";

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Missing token" });

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;
    const response = await axios.get(`${backend}/api/auth/verify?token=${token}`, {
      withCredentials: true
    });

    const result = typeof response.data === "object"
      ? response.data
      : { message: "Email verified" };

    return res.status(200).json(result);
  } catch (error) {
    const status = error.response?.status || 500;
    const msg = error.response?.data?.message || "Verification failed.";
    return res.status(status).json({ message: msg });
  }
}
