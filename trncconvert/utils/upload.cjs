const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sanitize = require("./filename.cjs");

const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const clean = sanitize(file.originalname);
    const ext = path.extname(clean);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});
