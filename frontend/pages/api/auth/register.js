import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;
    const response = await axios.post(`${backendUrl}/api/auth/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || "Register error";
    res.status(status).json({ message });
  }
}
