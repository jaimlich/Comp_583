// frontend/pages/api/auth/[...proxy].js
import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = createProxyMiddleware({
  target: 'http://localhost:5000', // your backend
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  onProxyReq: (proxyReq, req) => {
    // Fix cookie forwarding in dev
    proxyReq.setHeader('origin', 'http://localhost:3000');
  },
});

export default function handler(req, res) {
  return proxy(req, res, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error' });
    }
  });
}
