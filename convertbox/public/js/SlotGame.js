export class SlotGame {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.display = 'none';

        const oldBoard = document.getElementById('slot-board');
        if(oldBoard) oldBoard.remove();

        this.board = document.createElement('div');
        this.board.id = 'slot-board';
        this.board.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #2c3e50, #000);
            border-radius: 15px;
            color: white;
            padding: 20px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        `;
        this.canvasWrapper.appendChild(this.board);

        this.symbols = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '7️⃣'];
        this.isRunning = false;
        this.isSpinning = false;
        this.confettiElements = [];
        this.explosionInterval = null;
        this.memeInterval = null;
        this.textInterval = null;
        
        // Audio
        this.memeAudio = new Audio('/music/Banana.mp3'); 
        this.memeAudio.loop = true;
        this.memeAudio.volume = 1.0;

        this.difficulty = "Normal";
        this.archiveImages = []; 

        this.gameOverScreen = document.getElementById('game-over');
        this.usernameInput = document.getElementById('game-username');
        this.charSelectScreen = document.getElementById('character-select');
        this.scoreDisplay = document.getElementById('final-score');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");
        
        this.handleSpin = this.handleSpin.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.score = 0;
        this.startTime = 0;

        this.init();
    }

    init() {
        this.loadArchiveImages();
        this.setupStartScreen();
        this.addListeners();
    }

    loadArchiveImages() {
        for(let i=1; i<=166; i++) {
            this.archiveImages.push(`/foto/${i}.jpg`);
        }
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
        this.removeConfetti();
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
    }

    setupStartScreen() {
        const list = document.getElementById('char-list');
        list.innerHTML = '';
        
        const btn = document.createElement('button');
        btn.innerText = "BAŞLA";
        btn.className = "game-btn btn-blue";
        btn.style.marginTop = "20px";
        btn.onclick = () => {
            const name = this.usernameInput.value.trim();
            if(!name) { alert("İsim Girin!"); return; }
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
        
        this.renderGameUI();
        this.isRunning = true;
        this.startTime = Date.now();
    }

    renderGameUI() {
        this.board.innerHTML = '';
        
        const title = document.createElement('h2');
        title.innerText = "🎰 SLOT MACHINE 🎰";
        title.style.marginBottom = "20px";
        title.style.color = "#f1c40f";
        title.style.textShadow = "0 0 10px #f1c40f";
        this.board.appendChild(title);

        const reelsContainer = document.createElement('div');
        reelsContainer.style.display = "flex";
        reelsContainer.style.gap = "10px";
        reelsContainer.style.marginBottom = "20px";
        reelsContainer.style.background = "#34495e";
        reelsContainer.style.padding = "10px";
        reelsContainer.style.borderRadius = "10px";
        reelsContainer.style.border = "2px solid #ecf0f1";
        
        this.reels = [];
        for(let i=0; i<3; i++) {
            const reel = document.createElement('div');
            reel.className = "slot-reel";
            reel.style.width = "60px";
            reel.style.height = "100px";
            reel.style.background = "white";
            reel.style.border = "2px solid #bdc3c7";
            reel.style.borderRadius = "5px";
            reel.style.fontSize = "40px";
            reel.style.display = "flex";
            reel.style.alignItems = "center";
            reel.style.justifyContent = "center";
            reel.innerText = "❓";
            this.reels.push(reel);
            reelsContainer.appendChild(reel);
        }
        this.board.appendChild(reelsContainer);

        const msg = document.createElement('div');
        msg.id = "slot-msg";
        msg.style.height = "30px";
        msg.style.marginBottom = "10px";
        msg.style.fontWeight = "bold";
        msg.style.fontSize = "1.2rem";
        this.board.appendChild(msg);

        const spinBtn = document.createElement('button');
        spinBtn.innerText = "SPIN";
        spinBtn.className = "game-btn btn-green";
        spinBtn.style.padding = "15px 40px";
        spinBtn.style.fontSize = "1.2rem";
        spinBtn.onclick = () => this.handleSpin(spinBtn, msg);
        this.board.appendChild(spinBtn);

        this.initReels();
    }

    initReels() {
        this.reels.forEach(r => r.innerText = this.symbols[Math.floor(Math.random() * this.symbols.length)]);
    }

    handleSpin(btn, msg) {
        if(this.isSpinning) return;
        this.isSpinning = true;
        btn.disabled = true;
        btn.style.filter = "grayscale(1)";
        msg.innerText = "";

        const results = [];
        const intervalIds = [];
        
        // CHEAT CODE CHECK
        const username = this.usernameInput.value.trim().toLowerCase();
        const isCheat = (username === "adan kumbur");

        // Start spinning effect
        this.reels.forEach((reel, i) => {
            const interval = setInterval(() => {
                reel.innerText = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            }, 100);
            intervalIds.push(interval);

            // Stop each reel with a delay
            setTimeout(() => {
                clearInterval(interval);
                
                let finalSymbol;
                if(isCheat) {
                    finalSymbol = '💎'; // Force Win
                } else {
                    finalSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                }
                
                reel.innerText = finalSymbol;
                results[i] = finalSymbol;
                
                if(i === 2) {
                    this.finalizeSpin(results, btn, msg);
                }
            }, 1000 + (i * 500));
        });
    }

    finalizeSpin(results, btn, msg) {
        this.isSpinning = false;
        btn.disabled = false;
        btn.style.filter = "none";

        if(results[0] === results[1] && results[1] === results[2]) {
            msg.innerText = "JACKPOT!";
            msg.style.color = "#2ed573";
            msg.style.fontSize = "1.5rem";

            // Calculate Time Score
            const duration = (Date.now() - this.startTime) / 1000;
            this.score = parseFloat(duration.toFixed(2));

            // Celebration'ı try-catch içinde çalıştır
            try {
                this.triggerMegaCelebration();
            } catch(e) {
                console.error("Celebration hatası:", e);
            }

            // 3 saniye kutlama, sonra gameOver
            const self = this;
            setTimeout(function() {
                self.gameOver();
            }, 3000);

            // 5 saniye sonra kutlamayı durdur
            setTimeout(function() {
                self.removeConfetti();
            }, 5000);

        } else {
            msg.innerText = "Tekrar Dene!";
            msg.style.color = "#e74c3c";
        }
    }

    gameOver() {
        // Board'u gizle
        if (this.board) {
            this.board.style.display = 'none';
        }

        // Canvas wrapper'ı göster (game-over bunun içinde görünecek)
        this.canvasWrapper.style.display = 'block';

        // Game over ekranını göster (diğer oyunlar gibi)
        this.gameOverScreen.style.display = 'flex';
        this.scoreDisplay.innerText = this.score + " Saniye";

        // Kaydet butonunu göster
        const saveBtn = document.getElementById('btn-save-score');
        if (saveBtn) {
            saveBtn.style.display = 'inline-block';
        }
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
                gameName: 'SlotGame',
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
            const row = `<tr>
                <td>${i + 1}</td>
                <td>${s.username}</td>
                <td><span style="font-size:0.8rem; padding:2px 6px; border-radius:4px; background:${s.difficulty === 'Hard' ? '#ff4757' : (s.difficulty === 'Easy' ? '#2ed573' : '#1e90ff')}; color:white;">${s.difficulty || 'Normal'}</span></td>
                <td>${s.score} sn</td>
            </tr>`;
            this.leaderboardBody.innerHTML += row;
        });
    }

    handleRestart() {
        this.removeConfetti();
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
        document.getElementById('btn-save-score').style.display = 'inline-block';
        this.board.style.display = 'flex'; // Restore board
        this.startTime = Date.now(); // Reset time
        this.renderGameUI();
    }

    triggerMegaCelebration() {
        // 1. Play Banana Music
        this.memeAudio.currentTime = 0;
        this.memeAudio.play().catch(e => console.log(e));

        // 2. Shake Screen (Subtle)
        document.body.style.animation = "shakeScreen 0.5s infinite";

        // 3. Overlays (Simplified)
        document.getElementById('celebration-layer').style.display = 'block';
        document.getElementById('mega-win-msg').style.display = 'block';
        
        // 4. Explosions Loop (Slower)
        this.explosionInterval = setInterval(() => {
            this.createExplosion(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        }, 600);

        // 5. CHAOTIC BRAINROT TEXT POPUPS (Turkish, English, Russian, Chinese Mix)
        const funnyTexts = [
            "SKIBIDI TOILET 🚽", "RIZZ GOD 🥶", "SIGMA MALE 🗿", "OHIO MOMENT 💀", 
            "FANUM TAX 🍔", "GYATT DAMN 🍑", "MEWING 🤫", "SUSSY BAKA ඞ", 
            "GÜMLEDİM 💥", "PATLADIM 😂", "YOK ARTIK 😱", "SKIBIDI TURKO 🇹🇷",
            "SIGMA TÜRK 🗿", "EFSO ⚡", "KRAL 👑", "OLAY 🧨",
            "W RIZZ", "L BOZO", "COOKED 🔥", "BING CHILLING 🍦",
            "ŞAKA MI? 🤡", "KAOS 🌪️", "BOMBA 💣", "MELİH ÖPÜCÜĞÜ 💋",
            "666 🤙", "牛逼 (NB) 🔥", "泰酷辣 (Too Cool) 🌶️", "遥遥领先 🚀", "卧槽 (Wocao) 🤯",
            "ИМБА (IMBA) 💪", "СУЕТА (SUETA) 🏃", "КРИНЖ (CRINGE) 😬", "ХАЙП (HYPE) 📈", "АУФ (AUF) 🐺"
        ];
        
        // High frequency, low movement
        this.textInterval = setInterval(() => {
            const txt = document.createElement('div');
            txt.className = 'crazy-text';
            txt.innerText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];
            
            const isMobile = window.innerWidth < 768;
            const size = isMobile ? (Math.random() * 20 + 15) : (Math.random() * 40 + 30); 
            const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
            
            txt.style.fontSize = size + 'px';
            txt.style.color = color;
            txt.style.left = Math.random() * 90 + 5 + '%'; 
            txt.style.top = Math.random() * 90 + 5 + '%'; 
            
            document.body.appendChild(txt);
            this.confettiElements.push(txt);
            
            setTimeout(() => txt.remove(), 3000);
        }, 150);

        // 6. FLYING ARCHIVE IMAGES
        if(this.archiveImages.length > 0) {
            this.memeInterval = setInterval(() => {
                const img = document.createElement('img');
                img.src = this.archiveImages[Math.floor(Math.random() * this.archiveImages.length)];
                img.className = 'char-flying';
                
                const startX = Math.random() * 90 + 5;
                const startY = Math.random() * 90 + 5;
                
                img.style.left = startX + 'vw';
                img.style.top = startY + 'vh';
                const isMobile = window.innerWidth < 768;
                const w = isMobile ? (Math.random() * 80 + 40) : (Math.random() * 150 + 80);
                img.style.width = w + 'px';
                
                // Random Neon Effect
                if (Math.random() > 0.5) {
                    const neonColors = ['#00eaff', '#ff00ff', '#2ed573', '#f1c40f'];
                    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
                    img.style.boxShadow = `0 0 15px ${color}, 0 0 30px ${color}`;
                    img.style.border = `2px solid ${color}`;
                }

                document.body.appendChild(img);
                this.confettiElements.push(img);

                setTimeout(() => {
                    // Float up + Rotate
                    const rot = Math.random() * 360 - 180;
                    img.style.transform = `translateY(-100px) rotate(${rot}deg) scale(1.1)`;
                    img.style.opacity = '0';
                }, 50);
                
                setTimeout(() => img.remove(), 3000);
            }, 150); 
        }

        // 7. Confetti Storm
        for(let i=0; i<100; i++) {
            const confetti = document.createElement('div');
            const type = Math.random();
            confetti.innerText = type > 0.7 ? '🎈' : (type > 0.5 ? '🎊' : (type > 0.3 ? '🎉' : '💋'));
            confetti.style.position = 'fixed';
            confetti.style.zIndex = '2147483646'; 
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '100vh'; // Start from bottom
            const isMobile = window.innerWidth < 768;
            const size = isMobile ? (Math.random() * 20 + 15) : (Math.random() * 40 + 20);
            confetti.style.fontSize = size + 'px';
            confetti.className = 'confetti-item';
            
            // Simple rise animation
            const duration = Math.random() * 2 + 2;
            confetti.style.transition = `top ${duration}s linear, opacity ${duration}s`;
            
            document.body.appendChild(confetti);
            this.confettiElements.push(confetti);

            setTimeout(() => {
                confetti.style.top = '-10vh';
                if(Math.random() > 0.5) confetti.style.opacity = 0;
            }, 50);
        }
    }

    createExplosion(x, y) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
        const particles = 8;
        
        for (let i = 0; i < particles; i++) {
            const el = document.createElement('div');
            el.className = 'explosion';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.boxShadow = `0 0 20px ${el.style.background}, 0 0 40px white`;
            el.style.transition = 'all 1s ease-out';
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            document.body.appendChild(el);
            this.confettiElements.push(el);

            requestAnimationFrame(() => {
                el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
                el.style.opacity = 0;
            });
            setTimeout(() => el.remove(), 1000);
        }
    }

    removeConfetti() {
        this.memeAudio.pause();
        this.memeAudio.currentTime = 0;

        document.body.style.animation = "";

        const overlay = document.getElementById('celebration-layer');
        if(overlay) overlay.style.display = 'none';
        const strobe = document.getElementById('strobe-layer');
        if(strobe) strobe.style.display = 'none';
        const invert = document.getElementById('invert-layer');
        if(invert) invert.style.display = 'none';
        
        const textMsg = document.getElementById('mega-win-msg');
        if(textMsg) textMsg.style.display = 'none';

        if(this.explosionInterval) {
            clearInterval(this.explosionInterval);
            this.explosionInterval = null;
        }
        if(this.memeInterval) {
            clearInterval(this.memeInterval);
            this.memeInterval = null;
        }
        if(this.textInterval) {
            clearInterval(this.textInterval);
            this.textInterval = null;
        }

        this.confettiElements.forEach(el => el.remove());
        this.confettiElements = [];
        document.querySelectorAll('.confetti-item, .explosion, .char-flying, .crazy-text').forEach(e => e.remove());
    }

    resetUI() {
        this.isRunning = false;
        this.isSpinning = false;
        if(this.board) this.board.remove();
        this.canvasWrapper.style.display = 'none';
        this.charSelectScreen.style.display = 'block';
        this.removeConfetti();
    }
}