const express = require("express");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload.cjs");
const runCommand = require("../utils/runCommand.cjs");
const sanitize = require("../utils/filename.cjs");
const limiter = require("../utils/limiter.cjs");
const scheduleDelete = require("../utils/cleaner.cjs");

const router = express.Router();

function findLibreOffice() {
  const candidates = process.platform === "darwin"
    ? ["/Applications/LibreOffice.app/Contents/MacOS/soffice"]
    : ["/usr/lib/libreoffice/program/soffice", "/usr/bin/soffice", "/usr/bin/libreoffice"];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return "soffice"; // fallback to PATH
}

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.json({ success: false, error: "Dosya alınamadı." });

  let format = String(req.body.format || "").toLowerCase();
  const valid = ["pdf", "docx", "txt", "odt"];

  if (!valid.includes(format))
    return res.json({ success: false, error: "Geçersiz format." });

  const outputDir = path.join(__dirname, "..", "output");
  const inputPath = req.file.path;

  const base = sanitize(path.parse(req.file.originalname).name);
  const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const outName = base + "_" + uid + "." + format;
  const outputPath = path.join(outputDir, outName);

  const inputExt = path.extname(req.file.path).slice(1).toLowerCase();

  await limiter(res, async () => {
    try {

      if (inputExt === "pdf" && format === "docx") {
        const script = path.join(__dirname, "..", "scripts", "pdf2docx_convert.py");
        const cmd = `python3 "${script}" "${inputPath}" "${outputPath}"`;
        await runCommand(cmd);
      } else {
        const soffice = findLibreOffice();
        const cmd = `"${soffice}" --headless --convert-to ${format} --outdir "${outputDir}" "${inputPath}"`;
        await runCommand(cmd);

        const temp = path.join(
          outputDir,
          path.basename(inputPath, path.extname(inputPath)) + "." + format
        );

        if (fs.existsSync(temp)) fs.renameSync(temp, outputPath);
      }

      if (!fs.existsSync(outputPath))
        throw new Error("Dönüştürme başarısız.");

      scheduleDelete([inputPath, outputPath]);
      res.json({ success: true, downloadUrl: "/output/" + outName });

    } catch (e) {
      scheduleDelete([inputPath, outputPath]);
      res.json({ success: false, error: e.message });
    }
  });
});

module.exports = router;
