const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Dosya yolları
const SCORES_FILE = path.join(__dirname, '../data/globalScores.json');
const LOG_FILE = path.join(__dirname, '../data/globalLog.json');
const CHAR_DB_FILE = path.join(__dirname, '../data/characters.json');

// --- SKORLARI OKU (Oyun Bazlı) ---
router.get('/score', (req, res) => {
    const { gameName } = req.query; // gameName parametresi al
    
    fs.readFile(SCORES_FILE, 'utf8', (err, data) => {
        if (err) return res.json([]);
        try {
            const allScores = JSON.parse(data);
            if (Array.isArray(allScores)) {
                // Eski yapıdan kalma array varsa, boş dön veya migrate et
                res.json([]);
            } else {
                // Sadece istenen oyunun skorlarını dön
                res.json(allScores[gameName] || []);
            }
        } catch (e) {
            res.json([]);
        }
    });
});

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return text;
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- SKOR KAYDET (Oyun Bazlı) ---
router.post('/score', (req, res) => {
    let { username, score, gameName, difficulty } = req.body;
    if (!username || score === undefined || !gameName) {
        return res.status(400).json({ error: 'Eksik veri: username, score ve gameName gerekli.' });
    }

    // --- Validation & Sanitization ---
    // 1. Username Limit & Safe Chars (Allow alphanumeric + space)
    if (username.length > 15) username = username.substring(0, 15);
    username = username.replace(/[^a-zA-Z0-9 ]/g, ""); 
    if(username.trim() === "") username = "Anonim";

    // 2. Escape other string inputs
    gameName = escapeHtml(gameName);
    difficulty = escapeHtml(difficulty || 'Normal');

    let allScores = {};
    try {
        if (fs.existsSync(SCORES_FILE)) {
            const content = fs.readFileSync(SCORES_FILE, 'utf8');
            allScores = content ? JSON.parse(content) : {};
            if (Array.isArray(allScores)) allScores = {}; 
        }
    } catch (e) { allScores = {}; }

    if (!allScores[gameName]) allScores[gameName] = [];
    
    // --- SKOR MANTIĞI GÜNCELLEME (BEST SCORE PER USER) ---
    // Kullanıcının bu oyunda daha önce kaydı var mı?
    const existingIndex = allScores[gameName].findIndex(s => s.username === username);
    const isTimeBased = (gameName === 'MemoryGame' || gameName === 'SlotGame');
    const newScoreVal = parseFloat(score);

    if (existingIndex !== -1) {
        // Zaten kaydı var, karşılaştır
        const oldScoreVal = parseFloat(allScores[gameName][existingIndex].score);
        let isBetter = false;

        if (isTimeBased) {
            // Süre bazlı: Düşük olan daha iyi
            if (newScoreVal < oldScoreVal) isBetter = true;
        } else {
            // Puan bazlı: Yüksek olan daha iyi
            if (newScoreVal > oldScoreVal) isBetter = true;
        }

        if (isBetter) {
            // Yeni skor daha iyi, güncelle
            allScores[gameName][existingIndex] = {
                username,
                score: newScoreVal,
                difficulty: difficulty || 'Normal',
                date: new Date().toLocaleDateString()
            };
        }
        // Eğer daha kötü veya eşitse, hiçbir şey yapma (Eski rekor kalsın)
    } else {
        // Kullanıcının ilk skoru, direkt ekle
        allScores[gameName].push({ 
            username, 
            score: newScoreVal, 
            difficulty: difficulty || 'Normal', 
            date: new Date().toLocaleDateString() 
        });
    }
    
    // Sıralama Yap
    if (isTimeBased) {
        // Süre: Küçükten büyüğe
        allScores[gameName].sort((a, b) => a.score - b.score);
    } else {
        // Puan: Büyükten küçüğe
        allScores[gameName].sort((a, b) => b.score - a.score);
    }
    
    // İlk 10'u tut
    allScores[gameName] = allScores[gameName].slice(0, 10);

    fs.writeFileSync(SCORES_FILE, JSON.stringify(allScores, null, 2));

    // Log Tut
    let logs = [];
    try {
        if (fs.existsSync(LOG_FILE)) {
            const logContent = fs.readFileSync(LOG_FILE, 'utf8');
            logs = logContent ? JSON.parse(logContent) : [];
        }
    } catch (e) { logs = []; }

    logs.push({ 
        username, 
        score, 
        gameName, 
        difficulty, 
        userAgent: req.get('User-Agent'),
        date: new Date().toLocaleString() 
    });
    if (logs.length > 50) logs = logs.slice(-50); 
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

    res.json({ success: true, leaderboard: allScores[gameName] });
});

// --- KARAKTERLERİ LİSTELE ---
router.get('/characters', (req, res) => {
    fs.readFile(CHAR_DB_FILE, 'utf8', (err, data) => {
        if (err) return res.json([]);
        try {
            const chars = JSON.parse(data);
            res.json(chars);
        } catch (e) {
            res.json([]);
        }
    });
});

module.exports = router;