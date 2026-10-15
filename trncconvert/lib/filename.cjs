"use strict";
// Disk için güvenli ad ve indirme için okunabilir ad üretimi.

const TR_MAP = { "ş": "s", "Ş": "S", "ç": "c", "Ç": "C", "ğ": "g", "Ğ": "G", "ı": "i", "İ": "I", "ö": "o", "Ö": "O", "ü": "u", "Ü": "U" };
const TR_RE = new RegExp("[" + Object.keys(TR_MAP).join("") + "]", "g");

// Yalnızca ASCII; disk ve HTTP başlıkları için güvenli.
function asciiSafe(name) {
  const out = String(name)
    .normalize("NFC")
    .replace(TR_RE, (c) => TR_MAP[c])
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
  return out || "dosya";
}

// İndirme adı: Türkçe karakterleri korur, yol ayırıcılarını ve kontrol karakterlerini atar.
function displayBase(originalName) {
  const base = String(originalName || "")
    .normalize("NFC")
    .replace(/\.[^./\\]{1,8}$/, "")
    .replace(/[\u0000-\u001f\u007f/\\:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return base || "dosya";
}

// multer/busboy UTF-8 adları latin1 olarak çözebilir; geri çevirmeyi dener.
function fixLatin1(name) {
  const s = String(name || "");
  if (!/[\u0080-ÿ]/.test(s)) return s;
  const repaired = Buffer.from(s, "latin1").toString("utf8");
  return repaired.includes("�") ? s : repaired;
}

function contentDisposition(filename) {
  const fallback = asciiSafe(filename);
  const encoded = encodeURIComponent(filename)
    .replace(/['()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

module.exports = { asciiSafe, displayBase, fixLatin1, contentDisposition };
