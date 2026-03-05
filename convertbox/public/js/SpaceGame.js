// public/js/SpaceGame.js

export class SpaceGame {
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

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            width: 50,
            height: 50,
            img: null,
            speed: 5
        };

        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.enemyTimer = 0;
        this.shootCooldown = 0;

        this.keys = { left: false, right: false, shoot: false };

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
        this.handleClick = this.handleClick.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.init();
    }

    init() {
        this.createStars();
        this.loadCharacters();
        this.addListeners();
    }

    createStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }

    addListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('touchmove', this.handleMouseMove, { passive: false });
        this.canvas.addEventListener('touchstart', this.handleClick, { passive: false });
        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('touchmove', this.handleMouseMove);
        this.canvas.removeEventListener('touchstart', this.handleClick);
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
        if (e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.shoot();
        }
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
        this.player.x = clientX - rect.left;
        this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));
    }

    handleClick(e) {
        if (!this.isRunning) return;
        if (e.type === 'touchstart') e.preventDefault();
        this.shoot();
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
                gameName: 'SpaceGame',
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

    startGame(imgSrc) {
        this.charSelectScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.leaderboardSection.style.display = 'none';
        this.canvasWrapper.style.display = 'block';
        document.getElementById("btn-save-score").style.display = "inline-block";

        this.player.img = new Image();
        this.player.img.src = imgSrc;
        this.player.x = this.canvas.width / 2;

        this.score = 0;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.isRunning = true;
        this.isGameOver = false;

        this.loop();
    }

    shoot() {
        if (this.shootCooldown > 0) return;
        this.bullets.push({
            x: this.player.x,
            y: this.player.y - this.player.height / 2,
            width: 6,
            height: 15,
            speed: 10
        });
        this.shootCooldown = 10;
    }

    spawnEnemy() {
        const size = 30 + Math.random() * 20;
        // Düşman hızı zorluğa göre
        const diffSpeed = this.multiplier === 2 ? 1.5 : (this.multiplier === 1 ? 0.8 : 1);

        this.enemies.push({
            x: Math.random() * (this.canvas.width - size) + size / 2,
            y: -size,
            width: size,
            height: size,
            speed: (2 + Math.random() * 2) * diffSpeed,
            health: 1
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
            });
        }
    }

    update() {
        if (this.isGameOver) return;

        if (this.shootCooldown > 0) this.shootCooldown--;

        if (this.keys.left) this.player.x -= this.player.speed;
        if (this.keys.right) this.player.x += this.player.speed;
        this.player.x = Math.max(this.player.width / 2, Math.min(this.canvas.width - this.player.width / 2, this.player.x));

        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.canvas.height) {
                s.y = 0;
                s.x = Math.random() * this.canvas.width;
            }
        });

        // Enemy spawn rate
        let rate = 60 / (this.multiplier || 1.5);
        this.enemyTimer++;
        if (this.enemyTimer > rate - Math.min(this.score, 30)) {
            this.spawnEnemy();
            this.enemyTimer = 0;
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            if (this.bullets[i].y < -20) {
                this.bullets.splice(i, 1);
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.y += e.speed;

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                let b = this.bullets[j];
                if (b.x > e.x - e.width / 2 && b.x < e.x + e.width / 2 &&
                    b.y > e.y - e.height / 2 && b.y < e.y + e.height / 2) {
                    this.createExplosion(e.x, e.y);
                    this.enemies.splice(i, 1);
                    this.bullets.splice(j, 1);
                    // Puanı zorlukla çarp
                    this.score += 10 * this.multiplier;
                    break;
                }
            }

            if (e.x + e.width / 2 > this.player.x - this.player.width / 4 &&
                e.x - e.width / 2 < this.player.x + this.player.width / 4 &&
                e.y + e.height / 2 > this.player.y - this.player.height / 4 &&
                e.y - e.height / 2 < this.player.y + this.player.height / 4) {
                this.gameOver();
            }

            if (e.y > this.canvas.height + 50) {
                this.enemies.splice(i, 1);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        this.ctx.fillStyle = '#0a0a20';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.stars.forEach(s => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#00ff88';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
        });

        this.ctx.fillStyle = '#ff4444';
        this.enemies.forEach(e => {
            this.ctx.beginPath();
            this.ctx.moveTo(e.x, e.y - e.height / 2);
            this.ctx.lineTo(e.x + e.width / 2, e.y + e.height / 2);
            this.ctx.lineTo(e.x - e.width / 2, e.y + e.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
        });

        if (this.player.img) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.width / 2, 0, Math.PI * 2);
            this.ctx.clip();
            this.ctx.drawImage(this.player.img, this.player.x - this.player.width / 2, this.player.y - this.player.height / 2, this.player.width, this.player.height);
            this.ctx.restore();
            
            this.ctx.strokeStyle = '#00eaff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.width / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Skor: ${Math.floor(this.score)}`, 10, 30);
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