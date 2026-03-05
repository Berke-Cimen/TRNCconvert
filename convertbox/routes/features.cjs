const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const CHAT_FILE = path.join(__dirname, '../data/globalChat.json');
const STREAMS_FILE = path.join(__dirname, '../data/liveStreams.json');

function escapeHtml(text) {
    if (!text) return text;
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

router.get('/chat', (req, res) => {
    try {
        if (!fs.existsSync(CHAT_FILE)) fs.writeFileSync(CHAT_FILE, '[]');
        const messages = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
        res.json(messages.slice(-50)); 
    } catch (e) {
        res.json([]);
    }
});

router.post('/chat', (req, res) => {
    let { username, message } = req.body;
    if (!username || !message) return res.status(400).json({ success: false });

    username = escapeHtml(username).substring(0, 20); 
    message = escapeHtml(message).substring(0, 200);  

    try {
        if (!fs.existsSync(CHAT_FILE)) fs.writeFileSync(CHAT_FILE, '[]');
        const messages = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
        
        const newMessage = {
            id: Date.now(),
            username,
            message,
            time: new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}),
            fullDate: new Date().toLocaleString('tr-TR')
        };
        
        messages.push(newMessage);
        if (messages.length > 100) messages.shift();
        
        fs.writeFileSync(CHAT_FILE, JSON.stringify(messages, null, 2));
        res.json({ success: true, message: newMessage });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

router.get('/streams', (req, res) => {
    try {
        if (!fs.existsSync(STREAMS_FILE)) fs.writeFileSync(STREAMS_FILE, '[]');
        const streams = JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8'));
        res.json(streams);
    } catch (e) {
        res.json([]);
    }
});

const PLAYLIST_FILE = path.join(__dirname, '../data/playlist.json');

let activeUsers = new Map(); 

router.post('/heartbeat', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    activeUsers.set(ip, Date.now());
    res.json({ success: true });
});

router.get('/online-count', (req, res) => {
    const now = Date.now();
    const TIMEOUT = 2 * 60 * 1000; 
    
    for (const [ip, lastSeen] of activeUsers.entries()) {
        if (now - lastSeen > TIMEOUT) {
            activeUsers.delete(ip);
        }
    }
    
    res.json({ online: activeUsers.size });
});

router.get('/playlist', (req, res) => {
    try {
        if (!fs.existsSync(PLAYLIST_FILE)) fs.writeFileSync(PLAYLIST_FILE, '[]');
        const playlist = JSON.parse(fs.readFileSync(PLAYLIST_FILE, 'utf8'));
        res.json(playlist);
    } catch (e) {
        res.json([]);
    }
});

module.exports = router;