// public/js/MemoryGame.js

export class MemoryGame {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.display = 'none';

        // Mevcut board varsa temizle
        const oldBoard = document.getElementById('memory-board');
        if(oldBoard) oldBoard.remove();

        this.board = document.createElement('div');
        this.board.id = 'memory-board';
        this.board.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-gap: 10px;
            width: 100%;
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            background: #2f3542;
            border-radius: 10px;
        `;
        this.canvasWrapper.appendChild(this.board);

        this.score = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isRunning = false;
        
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        this.cards = [];
        this.images = [];

        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.charSelectScreen = document.getElementById('character-select');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
        if(this.board) this.board.remove();
        this.canvas.style.display = 'block';
    }

    async loadCharacters() {
        try {
            const res = await fetch('/api/characters');
            const chars = await res.json();
            
            if (chars && chars.length > 0) {
                this.images = chars.map(c => `/img/characters/${c.filename}`);
            } else {
                this.images = [];
            }
            
            // Yeterince kart yoksa (en az 8 çift lazım) foto klasöründen tamamla
            let fallbackIndex = 1;
            while(this.images.length < 8) {
                this.images.push(`/foto/${fallbackIndex}.jpg`); 
                fallbackIndex++;
                if(fallbackIndex > 160) fallbackIndex = 1; 
            }
            
            this.setupStartButton();
        } catch(e) { 
            console.error("Memory Game Char Load Error:", e);
            this.images = [];
            for(let i=1; i<=8; i++) this.images.push(`/foto/${i}.jpg`);
            this.setupStartButton();
        }
    }

    setupStartButton() {
        const list = document.getElementById('char-list');
        list.innerHTML = '';
        
        const btn = document.createElement('button');
        btn.innerText = "OYUNA BAŞLA";
        btn.className = "game-btn btn-blue";
        btn.style.marginTop = "50px";
        btn.onclick = () => {
            const name = this.usernameInput.value.trim();
            if(!name) { alert("İsim Girin!"); return; }
            
            const diffData = window.getGameDifficulty();
            this.difficulty = diffData.name;
            this.multiplier = diffData.multiplier;

            this.startGame();
        };
        list.appendChild(btn);
    }

    startGame() {
        this.charSelectScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
        this.canvasWrapper.style.display = 'block';
        document.getElementById('btn-save-score').style.display = 'inline-block';
        
        this.board.innerHTML = '';
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.isRunning = true;
        this.startTime = Date.now(); // Zamanı başlat

        // 8 benzersiz resim seç ve çiftle
        const uniqueImages = this.images.sort(() => 0.5 - Math.random()).slice(0, 8);
        const deck = [...uniqueImages, ...uniqueImages];
        deck.sort(() => 0.5 - Math.random());

        deck.forEach((imgSrc, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.img = imgSrc;
            
            // Kart Stili
            card.style.cssText = `
                background-color: #57606f;
                border-radius: 8px;
                cursor: pointer;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: transform 0.3s;
                transform-style: preserve-3d;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            `;

            // Ön Yüz (Soru İşareti)
            const front = document.createElement('div'); 
            front.innerText = "?";
            front.style.cssText = `
                position: absolute;
                width: 100%; height: 100%;
                display: flex; justify-content: center; align-items: center;
                color: white; font-size: 24px; font-weight: bold;
                backface-visibility: hidden;
            `;
            
            // Arka Yüz (Resim)
            const back = document.createElement('img');
            back.src = imgSrc;
            back.onerror = () => { back.src = '/foto/1.jpg'; };
            back.style.cssText = `
                width: 100%; height: 100%; 
                object-fit: cover; 
                object-position: center;
                background: #fff; 
                border-radius: 8px; 
                position: absolute;
                backface-visibility: hidden;
                transform: rotateY(180deg);
            `;

            card.appendChild(front);
            card.appendChild(back);

            card.onclick = () => this.flipCard(card, front, back);
            this.board.appendChild(card);
        });
    }

    flipCard(card, front, back) {
        if (!this.isRunning) return;
        if (this.flippedCards.length >= 2) return;
        if (this.flippedCards.includes(card)) return;

        // Çevirme Efekti
        card.style.transform = "rotateY(180deg)";
        
        this.flippedCards.push({ card, front, back });

        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;
        const img1 = first.card.dataset.img;
        const img2 = second.card.dataset.img;

        if (img1 === img2) {
            // Eşleşti
            this.matchedPairs++;
            this.flippedCards = [];
            
            // Efekt: Eşleşenleri hafif parlat
            first.card.style.boxShadow = "0 0 15px #2ed573";
            second.card.style.boxShadow = "0 0 15px #2ed573";
            
            if (this.matchedPairs === 8) {
                // OYUN BİTTİ - SKOR HESAPLA (SÜRE)
                const duration = (Date.now() - this.startTime) / 1000;
                this.score = parseFloat(duration.toFixed(2));
                setTimeout(() => this.gameOver(), 500);
            }
        } else {
            // Yanlış
            setTimeout(() => {
                first.card.style.transform = "rotateY(0deg)";
                second.card.style.transform = "rotateY(0deg)";
                this.flippedCards = [];
            }, 1000 / (this.multiplier === 2 ? 1.5 : 1));
        }
    }

    handleRestart() {
        this.startGame();
    }

    async handleSaveScore() {
        const username = this.usernameInput.value.trim();
        if (!username) { alert('İsim girin!'); return; }

        const btn = document.getElementById("btn-save-score");
        btn.disabled = true;
        btn.innerText = "Kaydediliyor...";

        const res = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                score: this.score, 
                gameName: 'MemoryGame',
                difficulty: this.difficulty
            })
        });
        const data = await res.json();
        if (data.success) {
            this.renderLeaderboard(data.leaderboard);
            btn.style.display = 'none';
        }
        btn.disabled = false;
        btn.innerText = "Kaydet";
    }

    renderLeaderboard(scores) {
        this.leaderboardSection.style.display = 'block';
        this.leaderboardBody.innerHTML = '';
        scores.forEach((s, i) => {
            this.leaderboardBody.innerHTML += `<tr>
                <td>${i + 1}</td>
                <td>${s.username}</td>
                <td>${s.difficulty || 'Normal'}</td>
                <td>${s.score} sn</td>
            </tr>`;
        });
    }

    gameOver() {
        this.isRunning = false;
        this.scoreDisplay.innerText = this.score + " Saniye";
        this.gameOverScreen.style.display = 'flex';
        this.board.innerHTML = '';
    }

    resetUI() {
        this.isRunning = false;
        this.canvasWrapper.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.charSelectScreen.style.display = 'block';
        this.leaderboardSection.style.display = 'none';
        if(this.board) this.board.innerHTML = '';
    }
}
