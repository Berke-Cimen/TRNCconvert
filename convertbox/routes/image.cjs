const express = require("express");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const upload = require("../utils/upload.cjs");
const limiter = require("../utils/limiter.cjs");
const sanitize = require("../utils/filename.cjs");
const scheduleDelete = require("../utils/cleaner.cjs");

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.json({ success: false, error: "Dosya alınamadı." });

  let format = String(req.body.format || "").toLowerCase();
  const valid = ["png", "jpg", "webp"];

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
      let p = sharp(inputPath);

      if (format === "jpg") p = p.jpeg({ quality: 90 });
      if (format === "png") p = p.png({ compressionLevel: 9 });
      if (format === "webp") p = p.webp({ quality: 90 });

      await p.toFile(outputPath);

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
