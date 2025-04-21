import jwt from 'jsonwebtoken';
import Cookies from 'cookies';

export default function handler(req, res) {
  const cookies = new Cookies(req, res);
  const refreshToken = cookies.get('refreshToken');

  if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newToken = jwt.sign({
      user_id: payload.user_id,
      email: payload.email,
      role: payload.role
    }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.setHeader("Set-Cookie", `token=${newToken}; Path=/; HttpOnly; SameSite=Strict`);
    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}
