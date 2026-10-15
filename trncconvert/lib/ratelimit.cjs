"use strict";

function clientIp(req) {
  const cf = req.get("cf-connecting-ip");
  if (cf && /^[0-9a-fA-F:.]{3,45}$/.test(cf)) return cf;
  return req.ip || "unknown";
}

const SCALE = Math.max(1, Number(process.env.RATE_LIMIT_SCALE) || 1);

function rateLimit({ windowMs, max: baseMax, message }) {
  const max = baseMax * SCALE;
  const hits = new Map();
  const timer = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [ip, list] of hits) {
      while (list.length && list[0] <= cutoff) list.shift();
      if (!list.length) hits.delete(ip);
    }
  }, Math.min(windowMs, 60000));
  timer.unref();

  return (req, res, next) => {
    const ip = clientIp(req);
    const now = Date.now();
    const list = hits.get(ip) || [];
    while (list.length && list[0] <= now - windowMs) list.shift();
    if (list.length >= max) {
      const retry = Math.ceil((list[0] + windowMs - now) / 1000);
      res.set("Retry-After", String(retry));
      return res.status(429).json({ error: "rate_limited", message });
    }
    list.push(now);
    hits.set(ip, list);
    next();
  };
}

module.exports = { rateLimit, clientIp };
