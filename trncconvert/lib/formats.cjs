"use strict";
// Format kataloğu: sunucu doğrulaması ve istemci arayüzü için tek doğruluk kaynağı.

const MAX_BYTES = 95 * 1024 * 1024;
const MAX_FILES = 10;

const GROUPS = [
  { id: "text", category: "document", engine: "office",
    inputs: ["docx", "doc", "odt", "rtf", "txt"],
    outputs: ["pdf", "docx", "odt", "rtf", "txt"] },
  { id: "sheet", category: "document", engine: "office",
    inputs: ["xlsx", "xls", "ods", "csv"],
    outputs: ["pdf", "xlsx", "ods", "csv"] },
  { id: "slides", category: "document", engine: "office",
    inputs: ["pptx", "ppt", "odp"],
    outputs: ["pdf", "pptx", "odp"] },
  { id: "pdf", category: "document", engine: "pdf",
    inputs: ["pdf"],
    outputs: ["docx", "txt", "jpg", "png"] },
  { id: "image", category: "image", engine: "image",
    inputs: ["jpg", "jpeg", "png", "webp", "avif", "gif", "tiff", "tif", "bmp", "heic", "heif", "svg"],
    outputs: ["jpg", "png", "webp", "avif", "gif", "tiff", "pdf"] },
  { id: "audio", category: "audio", engine: "media",
    inputs: ["mp3", "wav", "m4a", "aac", "ogg", "opus", "flac", "wma", "aiff", "aif"],
    outputs: ["mp3", "wav", "m4a", "ogg", "opus", "flac"] },
  { id: "video", category: "video", engine: "media",
    inputs: ["mp4", "mov", "mkv", "webm", "avi", "wmv", "m4v", "3gp"],
    outputs: ["mp4", "mov", "mkv", "webm", "avi", "gif", "mp3", "m4a", "wav"] },
];

const CATEGORIES = [
  { id: "document", label: "Belge" },
  { id: "image", label: "Görsel" },
  { id: "audio", label: "Ses" },
  { id: "video", label: "Video" },
];

const UNLOCKABLE = ["pdf", "docx", "xlsx", "pptx"];

// Aynı formatın farklı yazımları.
const CANON = { jpeg: "jpg", tif: "tiff", aif: "aiff", heif: "heic" };
const canon = (ext) => CANON[ext] || ext;

const LABELS = {
  pdf: "PDF", docx: "Word (DOCX)", doc: "Word 97-2003 (DOC)", odt: "OpenDocument metin (ODT)",
  rtf: "Zengin metin (RTF)", txt: "Düz metin (TXT)", xlsx: "Excel (XLSX)", xls: "Excel 97-2003 (XLS)",
  ods: "OpenDocument tablo (ODS)", csv: "CSV", pptx: "PowerPoint (PPTX)", ppt: "PowerPoint 97-2003 (PPT)",
  odp: "OpenDocument sunum (ODP)", jpg: "JPG", jpeg: "JPEG", png: "PNG", webp: "WebP", avif: "AVIF",
  gif: "GIF", tiff: "TIFF", tif: "TIFF", bmp: "BMP", heic: "HEIC", heif: "HEIF", svg: "SVG",
  mp3: "MP3", wav: "WAV", m4a: "M4A (AAC)", aac: "AAC", ogg: "OGG (Vorbis)", opus: "Opus",
  flac: "FLAC", wma: "WMA", aiff: "AIFF", aif: "AIFF", mp4: "MP4", mov: "MOV", mkv: "MKV",
  webm: "WebM", avi: "AVI", wmv: "WMV", m4v: "M4V", "3gp": "3GP",
};

// Çıktı uzantısı başına MIME türü (indirme için).
const MIME = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  csv: "text/csv; charset=utf-8",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odp: "application/vnd.oasis.opendocument.presentation",
  jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif",
  tiff: "image/tiff", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", ogg: "audio/ogg",
  opus: "audio/ogg", flac: "audio/flac", mp4: "video/mp4", mov: "video/quicktime",
  mkv: "video/x-matroska", webm: "video/webm", avi: "video/x-msvideo", zip: "application/zip",
};

function groupFor(ext) {
  const e = String(ext || "").toLowerCase();
  return GROUPS.find((g) => g.inputs.includes(e)) || null;
}

function targetsFor(ext) {
  const g = groupFor(ext);
  if (!g) return [];
  const self = canon(String(ext).toLowerCase());
  return g.outputs.filter((o) => canon(o) !== self);
}

function engineFor(ext, target) {
  const g = groupFor(ext);
  if (!g || !targetsFor(ext).includes(target)) return null;
  return g.engine;
}

function categoryFor(ext) {
  const g = groupFor(ext);
  return g ? g.category : null;
}

function allInputs() {
  return GROUPS.flatMap((g) => g.inputs);
}

function clientCatalog() {
  const targets = {};
  for (const ext of allInputs()) targets[ext] = targetsFor(ext);
  return {
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      inputs: GROUPS.filter((g) => g.category === c.id).flatMap((g) => g.inputs),
    })),
    targets,
    labels: LABELS,
    unlockable: UNLOCKABLE,
    maxBytes: MAX_BYTES,
    maxFiles: MAX_FILES,
  };
}

module.exports = {
  GROUPS, CATEGORIES, UNLOCKABLE, LABELS, MIME, MAX_BYTES, MAX_FILES,
  canon, groupFor, targetsFor, engineFor, categoryFor, allInputs, clientCatalog,
};
