import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const response = await axios.post(
      'http://smt_backend:5000/api/register',
      req.body
    );
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal Server Error';
    res.status(status).json({ message });
  }
}
