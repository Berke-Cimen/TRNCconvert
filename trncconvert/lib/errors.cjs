"use strict";

class UserError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const MESSAGES = {
  generic: "Dönüştürme tamamlanamadı. Dosya bozuk olabilir ya da bu içerik desteklenmiyor olabilir.",
  timeout: "İşlem çok uzun sürdü ve durduruldu. Daha kısa ya da daha küçük bir dosya deneyin.",
  encrypted_office: "Bu dosya parolayla korunuyor. Önce şifre kaldırma aracıyla parolayı kaldırın.",
  encrypted_pdf: "Bu PDF parolayla korunuyor. Önce PDF şifre kaldırma aracıyla parolayı kaldırın.",
  corrupt: "Dosya açılamadı. Bozuk olabilir ya da uzantısı içeriğiyle uyuşmuyor olabilir.",
  mismatch: "Dosyanın içeriği uzantısıyla uyuşmuyor. Doğru dosyayı seçtiğinizden emin olun.",
  no_audio: "Bu dosyada ses kanalı bulunamadı.",
  too_many_pages: "PDF çok fazla sayfa içeriyor. En fazla 300 sayfa görsele çevrilebilir.",
  busy: "Sunucu şu anda yoğun. Lütfen bir dakika sonra tekrar deneyin.",
};

const fail = (code, status) => new UserError(code, MESSAGES[code] || MESSAGES.generic, status);

module.exports = { UserError, MESSAGES, fail };
