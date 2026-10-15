"use strict";
// Yükleme ayarı: disk depolama, 95 MB sınırı, tek dosya, uzantı beyaz listesi.
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { MAX_BYTES } = require("./formats.cjs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const extOf = (name) => path.extname(String(name || "")).slice(1).toLowerCase();

function makeUpload(allowedExts) {
  const allowed = new Set(allowedExts);
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString("hex") + "." + extOf(file.originalname)),
  });
  const handler = multer({
    storage,
    limits: { fileSize: MAX_BYTES, files: 1, fields: 10, fieldSize: 4096 },
    fileFilter: (req, file, cb) => {
      if (!allowed.has(extOf(file.originalname))) {
        const err = new Error("unsupported_type");
        err.code = "UNSUPPORTED_TYPE";
        return cb(err);
      }
      cb(null, true);
    },
  }).single("file");

  // Hataları sabit Türkçe mesajlara çevirir.
  return (req, res, next) => handler(req, res, (err) => {
    if (!err) return next();
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "too_large", message: "Dosya 95 MB sınırını aşıyor." });
    }
    if (err.code === "UNSUPPORTED_TYPE") {
      return res.status(415).json({ error: "unsupported_type", message: "Bu dosya türü desteklenmiyor." });
    }
    return res.status(400).json({ error: "upload_failed", message: "Dosya yüklenemedi. Lütfen tekrar deneyin." });
  });
}

module.exports = { makeUpload, extOf, UPLOAD_DIR };
