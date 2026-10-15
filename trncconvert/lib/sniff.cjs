"use strict";
// Dosya imzasına (magic bytes) bakarak gerçek türü tahmin eder.
const fs = require("fs");

async function readHead(filePath, n = 4096) {
  const fh = await fs.promises.open(filePath, "r");
  try {
    const buf = Buffer.alloc(n);
    const { bytesRead } = await fh.read(buf, 0, n, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}

const hexAt = (b, hex, off = 0) => {
  const want = Buffer.from(hex, "hex");
  return b.length >= off + want.length && b.subarray(off, off + want.length).equals(want);
};
const asciiAt = (b, s, off = 0) => b.length >= off + s.length && b.toString("latin1", off, off + s.length) === s;

const SVG_RE = /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i;

function sniffBuffer(b) {
  if (b.length === 0) return "empty";
  if (b.subarray(0, 1024).toString("latin1").includes("%PDF-")) return "pdf";
  if (hexAt(b, "504b0304") || hexAt(b, "504b0506")) return "zip";
  if (hexAt(b, "d0cf11e0a1b11ae1")) return "cfb";
  if (asciiAt(b, "{\\rtf")) return "rtf";
  if (hexAt(b, "89504e470d0a1a0a")) return "png";
  if (hexAt(b, "ffd8ff")) return "jpeg";
  if (asciiAt(b, "GIF87a") || asciiAt(b, "GIF89a")) return "gif";
  if (asciiAt(b, "RIFF") && asciiAt(b, "WEBP", 8)) return "webp";
  if (asciiAt(b, "RIFF") && asciiAt(b, "WAVE", 8)) return "wav";
  if (asciiAt(b, "RIFF") && asciiAt(b, "AVI ", 8)) return "avi";
  if (asciiAt(b, "FORM") && (asciiAt(b, "AIFF", 8) || asciiAt(b, "AIFC", 8))) return "aiff";
  if (hexAt(b, "49492a00") || hexAt(b, "4d4d002a")) return "tiff";
  if (asciiAt(b, "BM") && b.length > 26) return "bmp";
  if (asciiAt(b, "fLaC")) return "flac";
  if (asciiAt(b, "OggS")) return "ogg";
  if (hexAt(b, "1a45dfa3")) return "matroska";
  if (hexAt(b, "3026b2758e66cf11")) return "asf";
  if (asciiAt(b, "ID3")) return "mp3";
  if (asciiAt(b, "ftyp", 4)) {
    const brand = b.toString("latin1", 8, 12);
    const compat = b.toString("latin1", 16, Math.min(b.length, 64));
    if (/^(avif|avis)/.test(brand)) return "avif";
    if (/^(heic|heix|heim|heis|hevc|hevx|mif1|msf1)/.test(brand)) {
      return /avif/.test(compat) && !/heic/.test(compat) ? "avif" : "heic";
    }
    return "mp4"; // isom, mp41, mp42, M4A, M4V, qt, 3gp ...
  }
  if (b[0] === 0xff && (b[1] & 0xf6) === 0xf0) return "aac"; // ADTS
  if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return "mp3"; // MPEG çerçeve senkronu
  const head = b.toString("utf8", 0, Math.min(b.length, 2048)).replace(/^﻿/, "");
  if (SVG_RE.test(head)) return "svg";
  if (!b.includes(0)) return "text";
  return "unknown";
}

async function sniff(filePath) {
  return sniffBuffer(await readHead(filePath));
}

// Uzantı başına kabul edilen imzalar.
const ALLOWED = {
  pdf: ["pdf"],
  docx: ["zip", "cfb"], xlsx: ["zip", "cfb"], pptx: ["zip", "cfb"],
  odt: ["zip"], ods: ["zip"], odp: ["zip"],
  doc: ["cfb"], xls: ["cfb"], ppt: ["cfb"],
  rtf: ["rtf", "text"], txt: ["text"], csv: ["text"],
  jpg: ["jpeg"], jpeg: ["jpeg"], png: ["png"], webp: ["webp"], gif: ["gif"],
  tiff: ["tiff"], tif: ["tiff"], bmp: ["bmp"], heic: ["heic", "avif"], heif: ["heic", "avif"],
  avif: ["avif", "heic"], svg: ["svg"],
  mp3: ["mp3"], wav: ["wav"], m4a: ["mp4", "aac"], aac: ["aac", "mp4"], ogg: ["ogg"], opus: ["ogg"],
  flac: ["flac"], wma: ["asf"], aiff: ["aiff"], aif: ["aiff"],
  mp4: ["mp4"], mov: ["mp4"], m4v: ["mp4"], "3gp": ["mp4"], mkv: ["matroska"], webm: ["matroska"],
  avi: ["avi"], wmv: ["asf"],
};
// Bazı ses dosyalarında imza tanınmayabilir (ör. ID3'süz MP3); bunları FFmpeg'e bırakırız.
const LENIENT = new Set(["mp3", "aac", "m4a", "wma"]);

function sniffMatches(ext, kind) {
  const allowed = ALLOWED[ext];
  if (!allowed) return false;
  if (allowed.includes(kind)) return true;
  return kind === "unknown" && LENIENT.has(ext);
}

module.exports = { sniff, sniffBuffer, sniffMatches };
