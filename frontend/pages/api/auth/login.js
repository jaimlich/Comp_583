import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;
    const response = await axios.post(`${backendUrl}/api/auth/login`, req.body, {
      withCredentials: true
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Internal login error";
    res.status(status).json({ message });
  }
}
