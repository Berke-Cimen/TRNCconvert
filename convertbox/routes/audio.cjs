const express = require("express");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload.cjs");
const limiter = require("../utils/limiter.cjs");
const sanitize = require("../utils/filename.cjs");
const scheduleDelete = require("../utils/cleaner.cjs");
const { exec } = require("child_process");

const router = express.Router();

function convertAudio(input, output, quality) {
  return new Promise((resolve, reject) => {
    let bitrate = quality === "low" ? "96k" : "192k";
    let cmd = `ffmpeg -y -i "${input}" -b:a ${bitrate} "${output}"`;

    exec(cmd, { timeout: 120000, maxBuffer: 50 * 1024 * 1024 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.json({ success: false, error: "Dosya alınamadı." });

  let format = String(req.body.format || "").toLowerCase();
  let quality = String(req.body.quality || "high").toLowerCase();

  const valid = ["mp3", "wav"];
  if (!valid.includes(format))
    return res.json({ success: false, error: "Geçersiz format." });

  const outputDir = path.join(__dirname, "..", "output");
  const inputPath = req.file.path;

  const base = sanitize(path.parse(req.file.originalname).name);
  const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const outName = base + "_" + uid + "." + format;
  const outputPath = path.join(outputDir, outName);

  await limiter(res, async () => {
    try {
      await convertAudio(inputPath, outputPath, quality);

      if (!fs.existsSync(outputPath))
        throw new Error("Çıktı oluşturulamadı.");

      scheduleDelete([inputPath, outputPath]);
      res.json({ success: true, downloadUrl: "/output/" + outName });

    } catch (e) {
      scheduleDelete([inputPath, outputPath]);
      res.json({ success: false, error: e.message });
    }
  });
});

module.exports = router;
