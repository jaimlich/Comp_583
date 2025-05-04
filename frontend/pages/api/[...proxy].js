import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const proxy = createProxyMiddleware({
  target: "http://localhost:5000",
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/api",
  },
  onProxyRes(proxyRes, req, res) {
    const cookies = proxyRes.headers["set-cookie"];
    if (cookies) {
      // Patch each cookie: strip Secure, Domain, and adjust SameSite for localhost
      const patchedCookies = cookies.map(cookie =>
        cookie
          .replace(/; Secure/gi, "") // 🔥 prevent blocking on localhost
          .replace(/; SameSite=None/gi, "; SameSite=Lax")
          .replace(/Domain=[^;]+;?/gi, "") // 🔥 strip Domain (conflicts with localhost)
      );

      res.setHeader("Set-Cookie", patchedCookies); // ✅ send patched cookies to browser
    }
  },
});

export default function handler(req, res) {
  return proxy(req, res, err => {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  });
}
