const express = require("express");
const path = require("path");
const fs = require('fs');
const archiver = require("archiver");

const documentRoute = require("./routes/document.cjs");
const imageRoute = require("./routes/image.cjs");
const audioRoute = require("./routes/audio.cjs");
const videoRoute = require("./routes/video.cjs");

// ---- Dizinleri oluştur ----
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");
[DATA_DIR, UPLOADS_DIR, OUTPUT_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// ---- Sağlık kontrolü (botGuard'dan önce) ----
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.use(express.json({ limit: '100kb' }));

// ---- Erişim günlüğü (asenkron, event loop'u bloklamaz) ----
const ACCESS_LOG_FILE = path.join(__dirname, 'data', 'accessLog.json');
if (!fs.existsSync(ACCESS_LOG_FILE)) {
    fs.writeFileSync(ACCESS_LOG_FILE, '[]');
}

let logBuffer = [];
let logFlushTimer = null;

const logAccess = (req, status, details = "") => {
    logBuffer.push({
        ip: req.ip || req.connection.remoteAddress,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date().toISOString(),
        status: status,
        details: details
    });

    if (!logFlushTimer) {
        logFlushTimer = setTimeout(flushLogs, 5000);
    }
};

function flushLogs() {
    logFlushTimer = null;
    if (logBuffer.length === 0) return;
    const entries = logBuffer.splice(0);
    try {
        let logs = [];
        if (fs.existsSync(ACCESS_LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(ACCESS_LOG_FILE, 'utf8'));
        }
        logs = entries.concat(logs);
        if (logs.length > 500) logs = logs.slice(0, 500);
        fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error("Günlük hatası:", e);
    }
}

// ---- Bot koruması ----
const botGuard = (req, res, next) => {
    if (req.path === '/health' || req.path === '/favicon.ico') return next();

    const ua = (req.get('User-Agent') || '').toLowerCase();
    const blocked = ['wget', 'curl', 'python', 'postman', 'httpclient', 'axios'];
    if (blocked.some(b => ua.includes(b))) {
        logAccess(req, 403, "Bot Engellendi: " + ua);
        return res.status(403).send('Erişim Engellendi');
    }
    next();
};
app.use(botGuard);

// ---- Statik dosyalar ----
app.use(express.static(path.join(__dirname, "public")));
app.use("/output", express.static(path.join(__dirname, "output")));
app.use("/foto", express.static(path.join(__dirname, "foto")));

// ---- API rotaları ----
app.use("/api/document", documentRoute);
app.use("/api/image", imageRoute);
app.use("/api/audio", audioRoute);
app.use("/api/video", videoRoute);

// ---- ZIP indirme ----
app.post("/api/download-zip", (req, res) => {
  const files = req.body.files;
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "Dosya listesi boş." });
  }

  const outputDir = path.join(__dirname, "output");
  const validFiles = files
    .map(f => {
      if (typeof f !== 'string') return null;
      const name = path.basename(f);
      const full = path.join(outputDir, name);
      if (!full.startsWith(outputDir) || !fs.existsSync(full)) return null;
      return { name, full };
    })
    .filter(Boolean);

  if (validFiles.length === 0) {
    return res.status(404).json({ error: "Geçerli dosya bulunamadı." });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=trncconvert-files.zip");

  const archive = archiver("zip", { zlib: { level: 5 } });
  archive.on("error", (err) => {
    console.error("Archiver hatası:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "ZIP oluşturma hatası." });
    } else {
      res.end();
    }
  });
  archive.pipe(res);

  for (const f of validFiles) {
    archive.file(f.full, { name: f.name });
  }

  archive.finalize();
});

// ---- Express hata yakalayıcı (catch-all) ----
app.use((err, req, res, next) => {
  console.error('İstek hatası:', err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: 'Sunucu hatası oluştu.' });
  }
});

// ---- Periyodik temizlik ----
const { cleanOldFiles } = require("./utils/cleaner.cjs");
cleanOldFiles(UPLOADS_DIR, 60 * 60 * 1000);
cleanOldFiles(OUTPUT_DIR, 60 * 60 * 1000);

setInterval(() => {
  cleanOldFiles(UPLOADS_DIR, 60 * 60 * 1000);
  cleanOldFiles(OUTPUT_DIR, 60 * 60 * 1000);
}, 15 * 60 * 1000);

// ---- Sunucu başlat ----
const server = app.listen(PORT, () => {
  console.log("TRNCConvert " + PORT + " portunda çalışıyor");
});

// ---- Graceful shutdown ----
function shutdown(signal) {
  console.log(signal + " alındı, sunucu kapatılıyor...");
  flushLogs();
  server.close(() => {
    console.log("Sunucu kapatıldı.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Zorla kapatılıyor...");
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Yakalanmamış istisna:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('İşlenmemiş promise reddi:', reason);
});
