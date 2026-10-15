"use strict";
const express = require("express");
const fs = require("fs");
const path = require("path");
const jobs = require("../lib/jobs.cjs");
const { UNLOCKABLE, MIME } = require("../lib/formats.cjs");
const { makeUpload } = require("../lib/upload.cjs");
const { sniff, sniffMatches } = require("../lib/sniff.cjs");
const { fixLatin1, displayBase } = require("../lib/filename.cjs");
const { rateLimit, clientIp } = require("../lib/ratelimit.cjs");
const { pyhelper, EXIT } = require("../lib/python.cjs");
const { MESSAGES } = require("../lib/errors.cjs");
const Semaphore = require("../lib/semaphore.cjs");

const MAX_ATTEMPTS = 3;
const MAX_PASSWORD_LENGTH = 1024;
const slots = new Semaphore(Math.max(1, Number(process.env.MAX_UNLOCK_JOBS) || 2));
const router = express.Router();

const limit = rateLimit({
  windowMs: 10 * 60 * 1000, max: 30,
  message: "Kısa sürede çok fazla deneme yapıldı. Lütfen 10 dakika sonra tekrar deneyin.",
});

const MSG = {
  not_encrypted: "Bu dosyada parola yok; zaten parolasız açılıyor.",
  unsupported: "Bu dosya türü ya da şifreleme yöntemi desteklenmiyor. Desteklenenler: PDF, DOCX, XLSX ve PPTX.",
  legacy: "Eski Office biçimleri (.doc, .xls, .ppt) desteklenmiyor. Dosyayı Office'te DOCX, XLSX ya da PPTX olarak kaydedip tekrar deneyin.",
  wrong_password: "Şifre yanlış. Büyük/küçük harfe ve klavye düzenine dikkat edin; İ ile I farklıdır.",
  too_many: "Üç kez yanlış şifre girildi. Güvenlik için dosya silindi; isterseniz yeniden yükleyebilirsiniz.",
  not_found: "Dosya bulunamadı ya da süresi doldu. Lütfen yeniden yükleyin.",
  failed: "Şifre kaldırılamadı. Dosya bozuk olabilir ya da desteklenmeyen bir koruma kullanıyor olabilir.",
};

const discard = (file) => file && fs.unlink(file.path, () => {});

router.post("/inspect", limit, makeUpload(UNLOCKABLE), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "no_file", message: "Dosya alınamadı." });
  try {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const kind = await sniff(file.path);
    if (!sniffMatches(ext, kind)) {
      discard(file);
      return res.status(400).json({ error: "mismatch", message: MESSAGES.mismatch });
    }
    const r = await slots.use(() => pyhelper(["inspect", file.path], { timeoutMs: 60000 }));
    if (r.code !== EXIT.OK) throw new Error(`inspect exit ${r.code}`);
    const info = JSON.parse(r.stdout.trim().split("\n").pop());

    if (info.state === "not_encrypted" || info.state === "unsupported") {
      discard(file);
      const key = info.kind === "legacy" ? "legacy" : info.state;
      return res.json({ state: info.state, message: MSG[key] });
    }

    const ip = clientIp(req);
    if (!jobs.canAccept(ip)) {
      discard(file);
      return res.status(503).json({ error: "busy", message: MESSAGES.busy });
    }
    const originalName = (typeof req.body.name === "string" && req.body.name.slice(0, 255)) || fixLatin1(file.originalname);
    const job = jobs.createJob({ type: "unlock", inputPath: file.path, ext, originalName, target: ext, quality: null, ip });
    job.status = "awaiting_password";
    res.json({ id: job.id, state: info.state, signed: Boolean(info.signed), kind: ext });
  } catch (err) {
    discard(file);
    console.error("unlock inspect:", err.message);
    res.status(500).json({ error: "server", message: MSG.failed });
  }
});

router.post("/:id", limit, express.json({ limit: "8kb" }), async (req, res) => {
  res.set("Cache-Control", "no-store");
  const job = jobs.getJob(req.params.id);
  if (!job || job.type !== "unlock" || job.status !== "awaiting_password") {
    return res.status(404).json({ error: "not_found", message: MSG.not_found });
  }
  const password = req.body && typeof req.body.password === "string" ? req.body.password : null;
  if (password === null || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({ error: "bad_password", message: "Geçerli bir şifre girin." });
  }

  job.status = "running";
  const out = path.join(job.workDir, "out." + job.input.ext);
  let r;
  try {
    r = await slots.use(() => pyhelper(["unlock", job.input.path, out], {
      input: JSON.stringify({ password }), timeoutMs: 180000,
    }));
  } catch (err) {
    r = { code: null, timedOut: false };
  }

  if (r.code === EXIT.OK && fs.existsSync(out)) {
    job.output = { path: out, name: `${displayBase(job.input.originalName)}.${job.input.ext}`, size: fs.statSync(out).size, mime: MIME[job.input.ext] };
    job.status = "done";
    fs.unlink(job.input.path, () => {});
    return res.json(jobs.publicView(job));
  }

  if (r.code === EXIT.WRONG_PASSWORD) {
    job.attempts += 1;
    if (job.attempts >= MAX_ATTEMPTS) {
      jobs.removeJob(job.id);
      return res.status(403).json({ error: "too_many_attempts", message: MSG.too_many });
    }
    job.status = "awaiting_password";
    return res.status(401).json({ error: "wrong_password", message: MSG.wrong_password, attemptsLeft: MAX_ATTEMPTS - job.attempts });
  }

  jobs.removeJob(job.id);
  if (r.code === EXIT.NOT_ENCRYPTED) return res.status(400).json({ error: "not_encrypted", message: MSG.not_encrypted });
  if (r.code === EXIT.UNSUPPORTED) return res.status(400).json({ error: "unsupported", message: MSG.unsupported });
  console.error(`unlock ${job.id.slice(0, 8)}: exit ${r.code}${r.timedOut ? " (timeout)" : ""}`);
  return res.status(500).json({ error: "failed", message: MSG.failed });
});

module.exports = { router };
