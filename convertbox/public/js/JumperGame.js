// public/js/JumperGame.js

export class JumperGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;

        // Difficulty
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        this.baseGravity = 0.4;
        this.jumpForce = -12;

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 150,
            width: 45,
            height: 45,
            dy: 0,
            img: null
        };

        this.platforms = [];
        this.maxHeight = 0;

        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.charSelectScreen = document.getElementById('character-select');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.keys = { left: false, right: false };

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', this.handleMouseMove, { passive: false });
        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('touchmove', this.handleMouseMove);
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
    }

    handleMouseMove(e) {
        if (!this.isRunning) return;
        const rect = this.canvas.getBoundingClientRect();
        let clientX;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            e.preventDefault();
        } else {
            clientX = e.clientX;
        }
        const scaleX = this.canvas.width / rect.width;
        this.player.x = (clientX - rect.left) * scaleX;
    }

    handleRestart() {
        if (this.player.img) this.startGame(this.player.img.src);
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
                score: Math.floor(this.score), 
                gameName: 'JumperGame',
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
                <td>${s.score}</td>
            </tr>`;
        });
    }

    resetUI() {
        this.isRunning = false;
        this.isGameOver = false;
        this.canvasWrapper.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.charSelectScreen.style.display = 'block';
        this.leaderboardSection.style.display = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async loadCharacters() {
        const list = document.getElementById('char-list');
        list.innerHTML = 'Yükleniyor...';

        try {
            const res = await fetch('/api/characters');
            const chars = await res.json();
            
            list.innerHTML = '';
            if (!chars || chars.length === 0) { list.innerHTML = '<p>Karakter yok.</p>'; return; }

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
            console.error(err);
            list.innerHTML = '<p>Hata.</p>';
        }
    }

    generatePlatforms() {
        this.platforms = [];

        this.platforms.push({
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height - 100,
            width: 100,
            height: 15,
            type: 'normal',
            direction: 1,
            speed: 2,
            broken: false
        });

        let lastY = this.canvas.height - 100;
        for (let i = 1; i < 8; i++) {
            lastY -= 60 + Math.random() * 30;
            this.addPlatformAt(lastY);
        }
    }

    addPlatformAt(y) {
        const safeZone = y > this.canvas.height - 300;
        const types = safeZone ? ['normal'] : ['normal', 'normal', 'moving', 'breaking'];
        const type = types[Math.floor(Math.random() * types.length)];

        // Hız zorlukla artar
        const speedMult = this.multiplier === 2 ? 1.5 : (this.multiplier === 1 ? 0.8 : 1);

        const platform = {
            x: Math.random() * (this.canvas.width - 80) + 10,
            y: y,
            width: 75,
            height: 15,
            type: type,
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: (1.5 + Math.random()) * speedMult,
            broken: false
        };
        this.platforms.push(platform);
    }

    startGame(imgSrc) {
        this.charSelectScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
        this.canvasWrapper.style.display = 'block';
        document.getElementById('btn-save-score').style.display = 'inline-block';

        this.player.img = new Image();
        this.player.img.src = imgSrc;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 150;
        this.player.dy = this.jumpForce;

        this.currentGravity = this.baseGravity * (this.multiplier === 2 ? 1.2 : 1); // Zor modda yerçekimi fazla

        this.score = 0;
        this.maxHeight = 0;
        this.isRunning = true;
        this.isGameOver = false;

        this.generatePlatforms();
        this.loop();
    }

    update() {
        if (this.isGameOver) return;

        const moveSpeed = 6;
        if (this.keys.left) this.player.x -= moveSpeed;
        if (this.keys.right) this.player.x += moveSpeed;

        if (this.player.x < 0) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width) this.player.x = 0;

        this.player.dy += this.currentGravity;
        this.player.y += this.player.dy;

        if (this.player.dy > 0) {
            for (let p of this.platforms) {
                if (p.broken) continue;

                const playerBottom = this.player.y + this.player.height / 2;
                const prevBottom = playerBottom - this.player.dy;
                const playerLeft = this.player.x - this.player.width / 2 + 10;
                const playerRight = this.player.x + this.player.width / 2 - 10;

                if (prevBottom <= p.y && playerBottom >= p.y &&
                    playerRight > p.x && playerLeft < p.x + p.width) {

                    if (p.type === 'breaking') {
                        p.broken = true;
                        this.player.dy = this.jumpForce * 0.7;
                    } else {
                        this.player.dy = this.jumpForce;
                    }
                    this.player.y = p.y - this.player.height / 2;
                    break;
                }
            }
        }

        this.platforms.forEach(p => {
            if (p.type === 'moving' && !p.broken) {
                p.x += p.speed * p.direction;
                if (p.x <= 0 || p.x + p.width >= this.canvas.width) {
                    p.direction *= -1;
                }
            }
        });

        const cameraLine = this.canvas.height / 3;
        if (this.player.y < cameraLine) {
            const diff = cameraLine - this.player.y;
            this.player.y = cameraLine;
            this.platforms.forEach(p => p.y += diff);

            this.maxHeight += diff;
            // Skor hesaplama: Yükseklik * Çarpan
            this.score = Math.floor((this.maxHeight / 10) * this.multiplier);
        }

        this.platforms = this.platforms.filter(p => p.y < this.canvas.height + 50);

        while (this.platforms.length < 8) {
            const highestY = Math.min(...this.platforms.map(p => p.y));
            this.addPlatformAt(highestY - 60 - Math.random() * 40);
        }

        if (this.player.y > this.canvas.height + 50) {
            this.gameOver();
        }
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const hue = (this.score / 5) % 60;
        gradient.addColorStop(0, `hsl(${200 + hue}, 70%, 55%)`);
        gradient.addColorStop(1, `hsl(${180 + hue}, 50%, 75%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 3; i++) {
            const cloudY = (this.maxHeight * 0.1 + i * 150) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(50 + i * 100, cloudY, 25, 0, Math.PI * 2);
            this.ctx.arc(75 + i * 100, cloudY - 10, 30, 0, Math.PI * 2);
            this.ctx.arc(100 + i * 100, cloudY, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.platforms.forEach(p => {
            this.ctx.save();
            if (p.broken) this.ctx.globalAlpha = 0.4;

            if (p.type === 'normal') this.ctx.fillStyle = '#4CAF50';
            else if (p.type === 'moving') this.ctx.fillStyle = '#2196F3';
            else if (p.type === 'breaking') this.ctx.fillStyle = '#FF9800';

            this.drawRoundedRect(p.x, p.y, p.width, p.height, 5);
            this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.ctx.fillRect(p.x + 5, p.y + 2, p.width - 10, 4);
            this.ctx.restore();
        });

        if (this.player.img && this.player.img.complete) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
            this.ctx.beginPath();
            this.ctx.ellipse(this.player.x, this.player.y + this.player.height/2 + 5, 20, 8, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.width / 2, 0, Math.PI * 2);
            this.ctx.clip();
            this.ctx.drawImage(this.player.img, this.player.x - this.player.width / 2, this.player.y - this.player.height / 2, this.player.width, this.player.height);
            this.ctx.restore();

            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.width / 2 + 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillText(`${Math.floor(this.score)}m`, 15, 35);
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.scoreDisplay.innerText = Math.floor(this.score);
        this.gameOverScreen.style.display = 'flex';
    }
}