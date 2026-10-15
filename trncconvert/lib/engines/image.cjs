"use strict";
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { pyhelper, EXIT } = require("../python.cjs");
const { fail } = require("../errors.cjs");
const { displayBase } = require("../filename.cjs");
const { MIME } = require("../formats.cjs");

sharp.cache(false);

const NEEDS_NORMALIZE = new Set(["heic", "heif", "bmp"]);
const ANIMATED_OUT = new Set(["gif", "webp"]);
const MAX_PIXELS = 100 * 1000 * 1000;
const SHARP_TIMEOUT_S = 120;

const QUALITY = {
  jpg: { low: 70, normal: 82, high: 92 },
  webp: { low: 70, normal: 82, high: 92 },
  avif: { low: 40, normal: 52, high: 66 },
};

async function normalize(job) {
  const out = path.join(job.workDir, "normalized.png");
  const r = await pyhelper(["normalize", job.input.path, out], { timeoutMs: 120000 });
  if (r.timedOut) throw fail("timeout");
  if (r.code === EXIT.UNSUPPORTED) throw fail("corrupt");
  if (r.code !== EXIT.OK) throw new Error(`normalize exit ${r.code}: ${r.stderr.slice(0, 300)}`);
  return out;
}

function pipeline(src, ext, target, quality) {
  const animated = ANIMATED_OUT.has(target) && (ext === "gif" || ext === "webp");
  const opts = { animated, limitInputPixels: MAX_PIXELS };
  if (ext === "svg") opts.density = 150;
  let img = sharp(src, opts).timeout({ seconds: SHARP_TIMEOUT_S });
  if (!animated) img = img.rotate();
  const q = (fmt) => QUALITY[fmt][quality] || QUALITY[fmt].normal;
  switch (target) {
    case "jpg": return img.flatten({ background: "#ffffff" }).jpeg({ quality: q("jpg"), mozjpeg: true });
    case "png": return img.png({ compressionLevel: 9 });
    case "webp": return img.webp({ quality: q("webp") });
    case "avif": return img.avif({ quality: q("avif"), effort: 4 });
    case "gif": return img.gif();
    case "tiff": return img.tiff({ compression: "lzw" });
    default: throw new Error("unsupported image target " + target);
  }
}

async function convert(job) {
  const { ext, originalName } = job.input;
  const target = job.target;
  const base = displayBase(originalName);
  let src = job.input.path;
  if (NEEDS_NORMALIZE.has(ext)) src = await normalize(job);

  try {
    if (target === "pdf") {
      const meta = await sharp(src, { limitInputPixels: MAX_PIXELS }).metadata();
      const usePng = Boolean(meta.hasAlpha);
      const tmp = path.join(job.workDir, usePng ? "page.png" : "page.jpg");
      const p = sharp(src, { limitInputPixels: MAX_PIXELS, density: ext === "svg" ? 150 : undefined })
        .timeout({ seconds: SHARP_TIMEOUT_S })
        .rotate();
      await (usePng ? p.png() : p.jpeg({ quality: 90, mozjpeg: true })).toFile(tmp);
      const out = path.join(job.workDir, "out.pdf");
      const r = await pyhelper(["img2pdf", tmp, out], { timeoutMs: 120000 });
      if (r.code !== EXIT.OK) throw new Error(`img2pdf exit ${r.code}: ${r.stderr.slice(0, 300)}`);
      return { path: out, name: `${base}.pdf`, mime: MIME.pdf };
    }

    const out = path.join(job.workDir, "out." + target);
    await pipeline(src, ext, target, job.quality).toFile(out);
    return { path: out, name: `${base}.${target}`, mime: MIME[target] };
  } catch (err) {
    if (err && /unsupported image format|Input file contains|corrupt|bad seek|VipsJpeg|pngload|Input buffer/i.test(String(err.message))) {
      throw fail("corrupt");
    }
    if (err && /pixel limit/i.test(String(err.message))) throw fail("corrupt");
    throw err;
  }
}

module.exports = { convert };
