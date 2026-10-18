"use strict";
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const jobs = require("./lib/jobs.cjs");
const { UPLOAD_DIR } = require("./lib/upload.cjs");
const api = require("./routes/api.cjs");
const unlock = require("./routes/unlock.cjs");
const site = require("./site/render.cjs");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const CANONICAL_HOST = new URL(site.SITE_URL).host;

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", "loopback, linklocal, uniquelocal");

app.get("/health", (req, res) => res.type("text/plain").send("OK"));

app.use((req, res, next) => {
  const host = req.get("host") || "";
  if (host.toLowerCase() === "www." + CANONICAL_HOST) {
    return res.redirect(301, site.SITE_URL + req.originalUrl);
  }
  next();
});

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
app.use((req, res, next) => {
  res.set({
    "Content-Security-Policy": CSP,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
  });
  if (req.secure) res.set("Strict-Transport-Security", "max-age=15552000");
  next();
});

const BLOCKED_UA = ["wget", "curl", "python-requests", "postman", "httpclient", "axios"];
app.use("/api", (req, res, next) => {
  const ua = (req.get("user-agent") || "").toLowerCase();
  if (BLOCKED_UA.some((b) => ua.includes(b))) return res.status(403).json({ error: "forbidden", message: "Erişim engellendi." });
  next();
});

function fileHash(rel) {
  try { return crypto.createHash("sha1").update(fs.readFileSync(path.join(PUBLIC_DIR, rel))).digest("hex").slice(0, 10); } catch (_) { return "0"; }
}
site.setAssetVersion(crypto.createHash("sha1")
  .update(["css/site.css", "js/app.js", "js/theme.js"].map(fileHash).join(":")).digest("hex").slice(0, 10));

const FONT_DIRS = [
  path.dirname(require.resolve("@fontsource-variable/archivo/package.json")),
].map((d) => path.join(d, "files"));
for (const dir of FONT_DIRS) {
  app.use("/fonts", express.static(dir, { immutable: true, maxAge: "365d", index: false, fallthrough: true }));
}
app.use(express.static(PUBLIC_DIR, {
  index: false,
  maxAge: "7d",
  setHeaders: (res, p) => { if (p.endsWith("favicon.svg")) res.set("Cache-Control", "public, max-age=86400"); },
}));

app.use("/api/unlock", unlock.router);
app.use("/api", api.router);
app.get("/dl/:id/:token", api.download);
app.use("/api", (req, res) => res.status(404).json({ error: "not_found", message: "Bulunamadı." }));

const PAGES = new Map();
PAGES.set("/", site.homePage());
for (const p of site.pageBySlug.values()) PAGES.set("/" + p.slug, site.toolPage(p));
for (const p of site.legalBySlug.values()) PAGES.set("/" + p.slug, site.legalPage(p));
const NOT_FOUND = site.notFoundPage();
const SITEMAP = site.sitemapXml();
const ROBOTS = site.robotsTxt();

app.get("/robots.txt", (req, res) => res.type("text/plain; charset=utf-8").set("Cache-Control", "public, max-age=3600").send(ROBOTS));
app.get("/sitemap.xml", (req, res) => res.type("application/xml; charset=utf-8").set("Cache-Control", "public, max-age=3600").send(SITEMAP));
app.get("/favicon.ico", (req, res) => res.redirect(301, "/favicon.svg"));
app.get("/index.html", (req, res) => res.redirect(301, "/"));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const p = req.path;
  if (p.length > 1 && p.endsWith("/")) {
    const clean = "/" + p.replace(/^\/+/, "").replace(/\/+$/, "");
    return res.redirect(301, clean);
  }
  const html = PAGES.get(p);
  if (!html) return next();
  res.set("Cache-Control", "public, max-age=300");
  res.type("html").send(html);
});

app.use((req, res) => {
  res.status(404).type("html").set("X-Robots-Tag", "noindex").send(NOT_FOUND);
});

app.use((err, req, res, next) => {
  const sensitive = req.path.startsWith("/api/unlock") || (err && err.type === "entity.parse.failed");
  console.error("istek hatası:", sensitive ? (err && err.type) || "unknown" : err && err.message);
  if (res.headersSent) return next(err);
  if (err && err.type === "entity.too.large") return res.status(413).json({ error: "too_large", message: "İstek çok büyük." });
  if (err && err.type === "entity.parse.failed") return res.status(400).json({ error: "bad_json", message: "Geçersiz istek." });
  res.status(500).json({ error: "server", message: "Sunucu hatası oluştu." });
});

jobs.cleanStale(UPLOAD_DIR, 60 * 60 * 1000);
jobs.cleanStale(jobs.OUTPUT_DIR, 60 * 60 * 1000);
setInterval(() => {
  jobs.sweep();
  jobs.cleanStale(UPLOAD_DIR, 30 * 60 * 1000);
  jobs.cleanStale(jobs.OUTPUT_DIR, 20 * 60 * 1000, jobs.knownWorkDirs());
}, 60 * 1000).unref();

if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`TRNCConvert ${PORT} portunda çalışıyor (${PAGES.size} sayfa).`));
  server.requestTimeout = 15 * 60 * 1000;
  const shutdown = (signal) => {
    console.log(`${signal} alındı, kapatılıyor.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => console.error("işlenmemiş promise reddi:", reason && reason.message));

module.exports = app;
