// public/js/Game.js

export class FlappyGame {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.canvasWrapper = document.getElementById("canvas-wrapper");
        this.gameContainer = document.getElementById("game-container");
        this.characterSelect = document.getElementById("character-select");
        this.usernameInput = document.getElementById("game-username");
        this.gameOverDiv = document.getElementById("game-over");
        this.scoreDisplay = document.getElementById("final-score");
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.characters = [];
        this.selectedCharacter = null;
        this.playerImg = null;
        this.username = "";
        this.score = 0;
        this.isRunning = false;
        this.isGameOver = false;

        this.baseGravity = 0.25;
        this.baseJumpForce = -5;
        this.baseSpeed = 1.5;
        this.pipeGap = 220;

        // Zorluk Çarpanları
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        this.player = { x: 80, y: 200, w: 55, h: 55, dy: 0 };
        this.pipes = [];

        this.handleJump = this.handleJump.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        document.addEventListener("keydown", this.handleJump);
        this.canvas.addEventListener("mousedown", this.handleJump);
        this.canvas.addEventListener("touchstart", this.handleJump, { passive: false });
        document.getElementById("btn-restart").addEventListener("click", this.handleRestart);
        document.getElementById("btn-save-score").addEventListener("click", this.handleSaveScore);
    }

    removeListeners() {
        document.removeEventListener("keydown", this.handleJump);
        this.canvas.removeEventListener("mousedown", this.handleJump);
        this.canvas.removeEventListener("touchstart", this.handleJump);
        
        const rBtn = document.getElementById("btn-restart");
        if(rBtn) rBtn.removeEventListener("click", this.handleRestart);
        
        const sBtn = document.getElementById("btn-save-score");
        if(sBtn) sBtn.removeEventListener("click", this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    handleJump(e) {
        if (e.type === 'touchstart') e.preventDefault();
        if ((e.code === "Space" || e.type === "mousedown" || e.type === "touchstart") && this.isRunning && !this.isGameOver) {
            this.player.dy = this.baseJumpForce; // Zıplama gücü sabit kalsın, yerçekimi hızlanacak
        }
    }

    handleRestart() {
        if (this.playerImg) {
            this.startGame(this.playerImg.src);
        }
    }

    async handleSaveScore() {
        const username = this.usernameInput.value.trim() || this.username;
        if (!username) { alert("Lütfen isim girin!"); return; }

        const btn = document.getElementById("btn-save-score");
        btn.innerText = "Kaydediliyor...";
        btn.disabled = true;

        try {
            const res = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    score: this.score, 
                    gameName: 'FlappyGame',
                    difficulty: this.difficulty 
                })
            });

            const data = await res.json();
            if (data.success) {
                // Liderlik Tablosunu Göster
                this.renderLeaderboard(data.leaderboard);
                btn.style.display = 'none'; // Tekrar kaydetmeyi önle
            } else {
                alert("Hata oluştu.");
            }
        } catch (e) {
            console.error(e);
            alert("Bağlantı hatası.");
        }
        btn.innerText = "Kaydet";
        btn.disabled = false;
    }

    renderLeaderboard(scores) {
        this.leaderboardSection.style.display = 'block';
        this.leaderboardBody.innerHTML = '';
        scores.forEach((s, i) => {
            const row = `<tr>
                <td>${i + 1}</td>
                <td>${s.username}</td>
                <td><span style="font-size:0.8rem; padding:2px 6px; border-radius:4px; background:${s.difficulty === 'Hard' ? '#ff4757' : (s.difficulty === 'Easy' ? '#2ed573' : '#1e90ff')}; color:white;">${s.difficulty || 'Normal'}</span></td>
                <td>${s.score}</td>
            </tr>`;
            this.leaderboardBody.innerHTML += row;
        });
    }

    async loadCharacters() {
        const container = document.getElementById("char-list");
        container.innerHTML = "Yükleniyor...";
        try {
            const res = await fetch('/api/characters');
            if (res.ok) this.characters = await res.json();
        } catch (e) {}

        container.innerHTML = "";
        if (!this.characters.length) { container.innerHTML = "<p>Karakter yok.</p>"; return; }

        this.characters.forEach(char => {
            const div = document.createElement("div");
            div.style.cssText = "display:flex; flex-direction:column; align-items:center; cursor:pointer; margin:10px;";
            const img = document.createElement("img");
            img.src = `/img/characters/${char.filename}`;
            img.onerror = () => { img.src = '/foto/1.jpg'; }; // Fallback
            img.style.cssText = "width:70px; height:70px; object-fit:contain; border:3px solid transparent; border-radius:10px; transition:0.2s; background:#eee;";
            
            div.onclick = () => {
                const name = this.usernameInput.value.trim();
                if (!name) { alert("Lütfen önce isminizi yazın!"); return; }
                
                // Zorluk Seçimini Al
                const diffData = window.getGameDifficulty();
                this.difficulty = diffData.name;
                this.multiplier = diffData.multiplier;

                this.username = name;
                this.startGame(img.src);
            };

            div.appendChild(img);
            div.appendChild(document.createTextNode(char.displayName));
            container.appendChild(div);
        });
    }

    startGame(imgSrc) {
        this.characterSelect.style.display = "none";
        this.canvasWrapper.style.display = "block";
        this.gameOverDiv.style.display = "none";
        this.leaderboardSection.style.display = "none";
        document.getElementById("btn-save-score").style.display = "inline-block";

        this.playerImg = new Image();
        this.playerImg.src = imgSrc;

        this.player.y = 200;
        this.player.dy = 0;
        this.pipes = [];
        this.score = 0;
        this.isRunning = true;
        this.isGameOver = false;

        // Zorluğa göre hız ayarla
        this.currentSpeed = this.baseSpeed * (this.multiplier || 1.5);
        this.currentGravity = this.baseGravity * (this.multiplier === 2 ? 1.3 : 1); // Hard modda yerçekimi biraz daha fazla

        this.loop();
    }

    update() {
        try {
            if (this.isGameOver) return;

            this.player.dy += this.currentGravity;
            this.player.y += this.player.dy;

            // Boru ekleme (Hıza göre aralık değişmeli)
            const pipeDistance = 250 / (this.multiplier || 1); 

            if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - pipeDistance) {
                const minHeight = 60;
                const maxHeight = this.canvas.height - this.pipeGap - minHeight;
                const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
                this.pipes.push({
                    x: this.canvas.width,
                    top: topHeight,
                    bottom: this.canvas.height - topHeight - this.pipeGap,
                    passed: false
                });
            }

            this.pipes.forEach(p => {
                p.x -= this.currentSpeed;

                if (!p.passed && p.x + 60 < this.player.x) {
                    // Zorluk çarpanına göre puan
                    this.score += 1 * (this.multiplier === 2 ? 2 : (this.multiplier === 1 ? 1 : 1.5));
                    p.passed = true;
                }

                            if (this.player.x + this.player.w - 10 > p.x && this.player.x + 10 < p.x + 60) {
                                if (this.player.y + 10 < p.top || this.player.y + this.player.h - 10 > this.canvas.height - p.bottom) {
                                    this.endGame();
                                }
                            }            });

            if (this.pipes.length > 0 && this.pipes[0].x < -70) this.pipes.shift();
            if (this.player.y + this.player.h > this.canvas.height || this.player.y < 0) this.endGame();
        } catch (e) {
            console.error("Update Error:", e);
            alert("Update Error: " + e.message);
            this.isRunning = false;
        }
    }

    draw() {
        try {
            const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            grad.addColorStop(0, "#4facfe");
            grad.addColorStop(1, "#00f2fe");
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.pipes.forEach(p => {
                this.ctx.fillStyle = "#75c138";
                this.ctx.fillRect(p.x, 0, 60, p.top);
                this.ctx.fillRect(p.x, this.canvas.height - p.bottom, 60, p.bottom);
            });

            if (this.playerImg && this.playerImg.complete) {
                this.ctx.save();
                this.ctx.translate(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
                this.ctx.rotate(Math.min(Math.max(this.player.dy * 3, -30), 90) * Math.PI / 180);
                this.ctx.drawImage(this.playerImg, -this.player.w / 2, -this.player.h / 2, this.player.w, this.player.h);
                this.ctx.restore();
            }

            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 48px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(Math.floor(this.score), this.canvas.width / 2, 70);
        } catch (e) {
            console.error("Draw Error:", e);
            alert("Draw Error: " + e.message);
            this.isRunning = false;
        }
    }

    loop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    endGame() {
        this.isRunning = false;
        this.isGameOver = true;
        this.scoreDisplay.innerText = Math.floor(this.score); // Küsuratsız göster
        this.gameOverDiv.style.display = "flex";
    }

    resetUI() {
        this.isRunning = false;
        this.isGameOver = false;
        this.canvasWrapper.style.display = "none";
        this.gameOverDiv.style.display = "none";
        this.characterSelect.style.display = "block";
        this.leaderboardSection.style.display = "none";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}