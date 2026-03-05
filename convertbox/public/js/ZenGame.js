// public/js/ZenGame.js

export class ZenGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.bubbles = [];
        this.particles = [];
        this.timer = 0;
        this.hue = 0;
        this.playerImg = null;

        // Difficulty
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        // Oyun süresi (60 saniye)
        this.baseTime = 60;
        this.timeLeft = this.baseTime;
        this.lastTime = 0;

        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.charSelectScreen = document.getElementById('character-select');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.handleInput = this.handleInput.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        this.canvas.addEventListener('mousedown', this.handleInput);
        this.canvas.addEventListener('touchstart', this.handleInput, {passive: false});
        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        this.canvas.removeEventListener('mousedown', this.handleInput);
        this.canvas.removeEventListener('touchstart', this.handleInput);
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    handleRestart() {
        if (this.playerImg) {
            this.startGame(this.playerImg.src);
        }
    }

    async handleSaveScore() {
        const username = this.usernameInput.value.trim();
        if (!username) { alert('İsim girin!'); return; }

        const btn = document.getElementById('btn-save-score');
        btn.innerText = 'Kaydediliyor...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username, 
                    score: this.score, 
                    gameName: 'ZenGame',
                    difficulty: this.difficulty
                })
            });
            const data = await res.json();
            if (data.success) {
                this.renderLeaderboard(data.leaderboard);
                btn.style.display = 'none';
            } else {
                alert('Hata oluştu.');
            }
        } catch (e) {
            console.error(e);
            alert('Bağlantı hatası.');
        }

        btn.innerText = 'Kaydet';
        btn.disabled = false;
    }

    renderLeaderboard(scores) {
        this.leaderboardSection.style.display = 'block';
        this.leaderboardBody.innerHTML = '';
        scores.forEach((s, i) => {
            this.leaderboardBody.innerHTML += `<tr>
                <td>${i + 1}</td>
                <td>${s.username}</td>
                <td>${s.difficulty || 'Normal'}</td>
                <td>${s.score}</td>
            </tr>`;
        });
    }

    handleInput(e) {
        if (!this.isRunning || this.isGameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;

        if(e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
            e.preventDefault();
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        this.checkPop(x, y);
    }

    resetUI() {
        this.isRunning = false;
        this.isGameOver = false;
        this.canvasWrapper.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.charSelectScreen.style.display = 'block';
        this.leaderboardSection.style.display = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const h2 = document.querySelector('#game-over h2');
        const p = document.querySelector('#game-over p');
        if (h2) h2.innerText = 'BİTTİ!';
        if (p) p.innerHTML = 'Puanınız: <span id="final-score" style="font-weight:bold; color:#ffa502;">0</span>';
    }

    checkPop(x, y) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            let b = this.bubbles[i];
            const dist = Math.hypot(x - b.x, y - b.y);

            if (dist < b.radius + 10) {
                this.popBubble(b);
                this.bubbles.splice(i, 1);
                // Skor artışı çarpanla
                this.score += 1 * (this.multiplier || 1);
                break;
            }
        }
    }

    popBubble(b) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1.0,
                color: `hsl(${Math.random() * 360}, 70%, 70%)`
            });
        }
    }

    async loadCharacters() {
        const list = document.getElementById('char-list');
        list.innerHTML = 'Yükleniyor...';

        try {
            const res = await fetch('/api/characters');
            const chars = await res.json();
            
            list.innerHTML = '';
            if (!chars || chars.length === 0) {
                list.innerHTML = '<p>Karakter yok.</p>';
                return;
            }

            chars.forEach(char => {
                const img = document.createElement('img');
                img.src = `/img/characters/${char.filename}`;
                img.onerror = () => { img.src = '/foto/1.jpg'; };
                img.style.cssText = 'width:60px; height:60px; border-radius:50%; cursor:pointer; object-fit:cover; margin:5px; border:3px solid transparent; transition:0.2s; background:#2f3542;';
                
                img.onclick = () => {
                    Array.from(list.children).forEach(c => c.style.borderColor = 'transparent');
                    img.style.borderColor = '#00eaff';
                    
                    const diffData = window.getGameDifficulty();
                    this.difficulty = diffData.name;
                    this.multiplier = diffData.multiplier;
                    setTimeout(() => this.startGame(img.src), 200);
                };
                list.appendChild(img);
            });
        } catch (err) {
            console.log("Karakter yükleme hatası:", err);
            list.innerHTML = '<p>Hata.</p>';
        }
    }

    startGame(imgSrc) {
        this.charSelectScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
        this.canvasWrapper.style.display = 'block';
        document.getElementById('btn-save-score').style.display = 'inline-block';

        this.playerImg = new Image();
        this.playerImg.src = imgSrc;

        this.score = 0;
        this.bubbles = [];
        this.particles = [];
        this.isRunning = true;
        this.isGameOver = false;
        this.hue = 0;
        this.timer = 0;
        this.timeLeft = this.baseTime;
        this.lastTime = Date.now();

        this.loop();
    }

    spawnBubble() {
        const radius = 25 + Math.random() * 25;
        // Zorluk seviyesine göre hız
        const speedMult = this.multiplier === 2 ? 1.5 : (this.multiplier === 1 ? 0.8 : 1);
        
        const b = {
            x: Math.random() * (this.canvas.width - radius * 2) + radius,
            y: this.canvas.height + radius,
            radius: radius,
            speed: (0.8 + Math.random() * 1.5) * speedMult,
            wobbleOffset: Math.random() * 100,
            wobbleSpeed: 0.02 + Math.random() * 0.03
        };
        this.bubbles.push(b);
    }

    update() {
        if (this.isGameOver) return;

        const now = Date.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.timeLeft -= delta;

        if (this.timeLeft <= 0) {
            this.gameOver();
            return;
        }

        this.hue += 0.2;
        this.timer++;

        // Spawn sıklığı
        let spawnThreshold = 35 / (this.multiplier || 1.5);
        if (this.timer > spawnThreshold) {
            this.spawnBubble();
            this.timer = 0;
        }

        for (let i = 0; i < this.bubbles.length; i++) {
            let b = this.bubbles[i];
            b.y -= b.speed;
            b.x += Math.sin(b.y * b.wobbleSpeed + b.wobbleOffset) * 0.5;

            if (b.y < -b.radius) {
                this.bubbles.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }

    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, `hsl(${this.hue}, 40%, 80%)`);
        gradient.addColorStop(1, `hsl(${this.hue + 40}, 40%, 90%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.bubbles.forEach(b => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius - 2, 0, Math.PI * 2);
            this.ctx.clip();
            if (this.playerImg && this.playerImg.complete) {
                this.ctx.drawImage(this.playerImg, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
            }
            this.ctx.restore();

            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.fill();
        });

        this.particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 22px "Segoe UI", sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puan: ${Math.floor(this.score)}`, 15, 30);

        const timeDisplay = Math.ceil(this.timeLeft);
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = this.timeLeft < 10 ? '#ff6b6b' : 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(`${timeDisplay}s`, this.canvas.width - 15, 30);

        const barWidth = this.canvas.width - 30;
        const barHeight = 6;
        const progress = this.timeLeft / this.baseTime;

        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(15, 40, barWidth, barHeight);

        const hueColor = progress > 0.3 ? 120 : (progress > 0.1 ? 60 : 0);
        this.ctx.fillStyle = `hsl(${hueColor}, 70%, 50%)`;
        this.ctx.fillRect(15, 40, barWidth * progress, barHeight);
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(this.loop.bind(this));
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.scoreDisplay.innerText = Math.floor(this.score);
        this.gameOverScreen.style.display = 'flex';
    }
}