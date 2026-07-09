// backend/controllers/health.controller.js
export function getHealth(req, res) {
  res.json({ status: "ok", service: "captcha", time: new Date().toISOString() });
}
