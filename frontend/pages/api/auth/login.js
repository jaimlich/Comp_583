import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await axios.post(`${backendUrl}/api/auth/login`, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Frontend API Proxy Error]', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal server error';
    res.status(status).json({ message });
  }
}
