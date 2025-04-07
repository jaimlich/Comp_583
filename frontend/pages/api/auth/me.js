import axios from 'axios';
import Cookies from 'cookies';

export default async function handler(req, res) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  if (!token) return res.status(401).json({ message: 'Not logged in' });

  try {
    const response = await axios.get('http://smt_backend:5000/api/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(401).json({ message: 'Session invalid' });
  }
}
