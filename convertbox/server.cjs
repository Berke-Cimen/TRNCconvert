const express = require("express");
const path = require("path");
const fs = require('fs');

const documentRoute = require("./routes/document.cjs");
const imageRoute = require("./routes/image.cjs");
const audioRoute = require("./routes/audio.cjs");
const videoRoute = require("./routes/video.cjs");
const gameRoute = require('./routes/game.cjs');
const featuresRoute = require("./routes/features.cjs");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use(express.json());

const ACCESS_LOG_FILE = path.join(__dirname, 'data', 'accessLog.json');
if (!fs.existsSync(ACCESS_LOG_FILE)) {
    fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify([], null, 2));
}

const logAccess = (req, status, details = "") => {
    try {
        const logEntry = {
            ip: req.ip || req.connection.remoteAddress,
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent') || 'Unknown',
            timestamp: new Date().toLocaleString(),
            status: status,
            details: details
        };

        let logs = [];
        if (fs.existsSync(ACCESS_LOG_FILE)) {
            logs = JSON.parse(fs.readFileSync(ACCESS_LOG_FILE, 'utf8'));
        }
        logs.unshift(logEntry); 
        if (logs.length > 500) logs = logs.slice(0, 500); 
        fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error("Logging error:", e);
    }
};

const botGuard = (req, res, next) => {
    const ua = (req.get('User-Agent') || '').toLowerCase();
    const blocked = ['wget', 'curl', 'python', 'postman', 'httpclient', 'axios'];
    if (blocked.some(b => ua.includes(b))) {
        logAccess(req, 403, "Bot Blocked: " + ua);
        return res.status(403).send('Access Denied');
    }
    next();
};
app.use(botGuard);

app.use(express.static(path.join(__dirname, "public")));
app.use("/output", express.static(path.join(__dirname, "output")));
app.use("/foto", express.static(path.join(__dirname, "foto")));

const STREAMS_FILE = path.join(__dirname, 'data', 'liveStreams.json');
app.get('/api/streams', (req, res) => {
    try {
        if (!fs.existsSync(STREAMS_FILE)) {
            fs.writeFileSync(STREAMS_FILE, '[]');
        }
        const streams = JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8'));
        res.json(streams);
    } catch (e) {
        res.json([]);
    }
});

app.use('/api', gameRoute);
app.use('/api', featuresRoute);
app.use("/api/document", documentRoute);
app.use("/api/image", imageRoute);
app.use("/api/audio", audioRoute);
app.use("/api/video", videoRoute);

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");
[DATA_DIR, UPLOADS_DIR, OUTPUT_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const { cleanOldFiles } = require("./utils/cleaner.cjs");
// Başlangıçta 1 saatten eski geçici dosyaları temizle
cleanOldFiles(UPLOADS_DIR, 60 * 60 * 1000);
cleanOldFiles(OUTPUT_DIR, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log("ConvertBox listening on port " + PORT);
});