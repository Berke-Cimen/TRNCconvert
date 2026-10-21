"use strict";
const express = require("express");
const fs = require("fs");
const formats = require("../lib/formats.cjs");
const jobs = require("../lib/jobs.cjs");
const { makeUpload } = require("../lib/upload.cjs");
const { sniff, sniffMatches } = require("../lib/sniff.cjs");
const { fixLatin1, contentDisposition } = require("../lib/filename.cjs");
const { rateLimit, clientIp } = require("../lib/ratelimit.cjs");
const { MESSAGES } = require("../lib/errors.cjs");
const { streamZip } = require("../lib/zip.cjs");

const ENGINES = {
  office: require("../lib/engines/office.cjs"),
  pdf: require("../lib/engines/pdf.cjs"),
  image: require("../lib/engines/image.cjs"),
  media: require("../lib/engines/media.cjs"),
};

const QUALITIES = new Set(["low", "normal", "high"]);
const router = express.Router();

const convertLimit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 60,
  message: "Kısa sürede çok fazla dosya gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.",
});
const zipLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, message: "Çok fazla istek. Lütfen biraz bekleyin." });

const discard = (file) => file && fs.unlink(file.path, () => {});

function originalNameOf(req) {
  const fromField = typeof req.body.name === "string" ? req.body.name.slice(0, 255) : "";
  return fromField || fixLatin1(req.file.originalname);
}

router.get("/catalog", (req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json(formats.clientCatalog());
});

router.post("/convert", convertLimit, makeUpload(formats.allInputs()), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "no_file", message: "Dosya alınamadı." });
  const ip = clientIp(req);
  try {
    const ext = require("path").extname(file.originalname).slice(1).toLowerCase();
    const target = String(req.body.target || "").toLowerCase();
    const quality = QUALITIES.has(req.body.quality) ? req.body.quality : "normal";
    const engine = formats.engineFor(ext, target);
    if (!engine) {
      discard(file);
      return res.status(400).json({ error: "bad_target", message: "Bu dosya seçilen formata dönüştürülemiyor." });
    }
    const kind = await sniff(file.path);
    if (kind === "empty") {
      discard(file);
      return res.status(400).json({ error: "empty", message: "Dosya boş." });
    }
    if (!sniffMatches(ext, kind)) {
      discard(file);
      return res.status(400).json({ error: "mismatch", message: MESSAGES.mismatch });
    }
    if (kind === "cfb" && ["docx", "xlsx", "pptx"].includes(ext)) {
      discard(file);
      return res.status(400).json({ error: "encrypted_office", message: MESSAGES.encrypted_office });
    }
    if (!jobs.canAccept(ip)) {
      discard(file);
      return res.status(503).json({ error: "busy", message: MESSAGES.busy });
    }
    const job = jobs.createJob({
      type: "convert", inputPath: file.path, ext, originalName: originalNameOf(req), target, quality, ip,
    });
    jobs.enqueue(job, ENGINES[engine].convert);
    res.status(202).json({ ...jobs.publicView(job), token: job.token });
  } catch (err) {
    discard(file);
    console.error("convert route:", err.message);
    res.status(500).json({ error: "server", message: "Sunucu hatası oluştu. Lütfen tekrar deneyin." });
  }
});

router.get("/jobs/:id", (req, res) => {
  const found = jobs.getJob(req.params.id);
  const job = found && jobs.tokenMatches(found, req.query.t) ? found : null;
  res.set("Cache-Control", "no-store");
  if (!job) return res.status(404).json({ error: "not_found", message: "İş bulunamadı ya da süresi doldu." });
  res.json(jobs.publicView(job));
});

router.delete("/jobs/:id", (req, res) => {
  const found = jobs.getJob(req.params.id);
  res.set("Cache-Control", "no-store");
  if (!found || !jobs.tokenMatches(found, req.query.t)) {
    return res.status(404).json({ error: "not_found", message: "Dosya bulunamadı ya da zaten silinmiş." });
  }
  if (found.status === "running") {
    return res.status(409).json({ error: "running", message: "Dosya işlenirken silinemez. Bitince tekrar deneyin." });
  }
  jobs.removeJob(found.id);
  res.json({ deleted: true });
});

router.post("/zip", zipLimit, express.json({ limit: "8kb" }), (req, res) => {
  const list = Array.isArray(req.body && req.body.items) ? req.body.items.slice(0, formats.MAX_FILES) : [];
  const items = [];
  for (const it of list) {
    const job = it && jobs.getJob(it.id);
    if (job && job.status === "done" && jobs.tokenMatches(job, it.token) && fs.existsSync(job.output.path)) {
      items.push({ path: job.output.path, name: job.output.name });
    }
  }
  if (items.length === 0) return res.status(404).json({ error: "not_found", message: "İndirilecek dosya bulunamadı." });
  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": contentDisposition("trncconvert-dosyalar.zip"),
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  });
  streamZip(res, items, (err) => {
    console.error("zip:", err.message);
    res.destroy();
  });
});

function download(req, res) {
  const job = jobs.getJob(req.params.id);
  if (!job || job.status !== "done" || !jobs.tokenMatches(job, req.params.token) || !fs.existsSync(job.output.path)) {
    return res.status(404).type("text/plain; charset=utf-8").send("Dosya bulunamadı ya da süresi doldu.");
  }
  res.set({
    "Content-Type": job.output.mime || "application/octet-stream",
    "Content-Disposition": contentDisposition(job.output.name),
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  });
  res.sendFile(job.output.path, (err) => {
    if (err && !res.headersSent) res.status(404).end();
  });
}

module.exports = { router, download };
