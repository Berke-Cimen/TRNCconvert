"use strict";
const net = require("net");

const CLOUDFLARE_V4 = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18",
  "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17",
  "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
];
const CLOUDFLARE_V6 = [
  "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32",
  "2a06:98c0::/29", "2c0f:f248::/32",
];

const cloudflare = new net.BlockList();
for (const c of CLOUDFLARE_V4) { const [a, b] = c.split("/"); cloudflare.addSubnet(a, Number(b), "ipv4"); }
for (const c of CLOUDFLARE_V6) { const [a, b] = c.split("/"); cloudflare.addSubnet(a, Number(b), "ipv6"); }

function normalizeIp(ip) {
  const s = String(ip || "");
  return s.startsWith("::ffff:") && net.isIPv4(s.slice(7)) ? s.slice(7) : s;
}

function fromCloudflare(ip) {
  const family = net.isIPv4(ip) ? "ipv4" : net.isIPv6(ip) ? "ipv6" : null;
  return family ? cloudflare.check(ip, family) : false;
}

function clientIp(req) {
  const peer = normalizeIp(req.ip);
  const cf = req.get("cf-connecting-ip");
  if (cf && net.isIP(cf) && fromCloudflare(peer)) return normalizeIp(cf);
  return peer || "unknown";
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
