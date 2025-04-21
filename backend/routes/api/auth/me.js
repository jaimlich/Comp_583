import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

export default async function handler(req, res) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: { user_id: payload.user_id, email: payload.email, role: payload.role } });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
