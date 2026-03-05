// public/js/CarGame.js

export class CarGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.baseSpeed = 5;

        // Difficulty
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        this.laneWidth = this.canvas.width / 3;
        this.lanes = [
            this.laneWidth / 2,                
            this.laneWidth + this.laneWidth / 2, 
            (this.laneWidth * 2) + this.laneWidth / 2 
        ];
        this.currentLane = 1;

        this.player = {
            x: this.lanes[1],
            y: this.canvas.height - 100,
            width: 50,
            height: 80, 
            img: null
        };

        this.obstacles = [];
        this.obstacleTimer = 0;

        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.charSelectScreen = document.getElementById('character-select');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        window.addEventListener('keydown', this.handleKeyDown);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        
        const rBtn = document.getElementById('btn-restart');
        if(rBtn) rBtn.removeEventListener('click', this.handleRestart);
        const sBtn = document.getElementById('btn-save-score');
        if(sBtn) sBtn.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        if (e.key === 'ArrowLeft') this.moveLane(-1);
        if (e.key === 'ArrowRight') this.moveLane(1);
    }

    handleMouseDown(e) {
        if (!this.isRunning) return;
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < this.canvas.width / 2) this.moveLane(-1);
        else this.moveLane(1);
    }

    handleRestart() {
        if(this.player.img) this.startGame(this.player.img.src);
    }

    async handleSaveScore() {
        const username = this.usernameInput.value.trim();
        if (!username) { alert('İsim girin!'); return; }
        
        const btn = document.getElementById("btn-save-score");
        btn.innerText = "Kaydediliyor...";
        btn.disabled = true;

        const res = await fetch('/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                score: Math.floor(this.score), 
                gameName: 'CarGame',
                difficulty: this.difficulty
            })
        });
        const data = await res.json();
        
        if (data.success) {
            this.renderLeaderboard(data.leaderboard);
            btn.style.display = 'none';
        } else {
            alert('Hata: ' + data.error);
        }
        btn.innerText = "Kaydet";
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

    resetUI() {
        this.isRunning = false;
        this.isGameOver = false;
        this.canvasWrapper.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.charSelectScreen.style.display = 'block';
        this.leaderboardSection.style.display = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    moveLane(direction) {
        let newLane = this.currentLane + direction;
        if (newLane >= 0 && newLane <= 2) {
            this.currentLane = newLane;
            this.player.x = this.lanes[this.currentLane];
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
                list.innerHTML = '<p>Karakter yok. Admin panelinden ekleyin.</p>'; 
                return; 
            }

            chars.forEach(char => {
                const img = document.createElement('img');
                img.src = `/img/characters/${char.filename}`;
                // Resim yüklenemezse varsayılanı göster
                img.onerror = () => { img.src = '/foto/1.jpg'; };
                img.style.cssText = 'width:60px; height:60px; border-radius:50%; cursor:pointer; object-fit:cover; margin:5px; border:3px solid transparent; transition:0.2s; background:#2f3542;';
                
                img.onclick = () => {
                    // Seçim efekti
                    Array.from(list.children).forEach(c => c.style.borderColor = 'transparent');
                    img.style.borderColor = '#00eaff';
                    
                    const diffData = window.getGameDifficulty();
                    this.difficulty = diffData.name;
                    this.multiplier = diffData.multiplier;
                    
                    // Hafif gecikmeyle başlat ki seçim görünsün
                    setTimeout(() => this.startGame(img.src), 200);
                };
                list.appendChild(img);
            });
        } catch (err) {
            console.error(err);
            list.innerHTML = '<p>Karakter listesi yüklenemedi.</p>';
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
        this.player.x = this.lanes[1]; 
        this.currentLane = 1;

        this.score = 0;
        this.obstacles = [];
        this.isRunning = true;
        this.isGameOver = false;

        // Difficulty Settings
        this.currentSpeed = this.baseSpeed * (this.multiplier === 1 ? 0.8 : (this.multiplier === 2 ? 1.4 : 1));

        this.loop();
    }

    spawnObstacle() {
        const laneIndex = Math.floor(Math.random() * 3);
        const obs = {
            x: this.lanes[laneIndex],
            y: -100,
            width: 50,
            height: 80,
            lane: laneIndex,
            color: 'red'
        };
        this.obstacles.push(obs);
    }

    update() {
        if (this.isGameOver) return;
        
        // Zorluk arttıkça daha sık engel
        let spawnRate = 60 / (this.multiplier || 1.5);
        this.obstacleTimer++;
        
        if (this.obstacleTimer > spawnRate - Math.min(this.score / 10, 20)) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        this.currentSpeed += 0.005; // Yavaşça hızlan

        for (let i = 0; i < this.obstacles.length; i++) {
            let obs = this.obstacles[i];
            obs.y += this.currentSpeed;

            // Çarpışma (Daha affedici hitbox)
            const pLeft = this.player.x - this.player.width/2 + 15;
            const pRight = this.player.x + this.player.width/2 - 15;
            const pTop = this.player.y + 15;
            const pBottom = this.player.y + this.player.height - 15;

            const oLeft = obs.x - obs.width/2;
            const oRight = obs.x + obs.width/2;
            const oTop = obs.y;
            const oBottom = obs.y + obs.height;

            if (pLeft < oRight && pRight > oLeft && pTop < oBottom && pBottom > oTop) {
                this.gameOver();
            }

            if (obs.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
                // Zorluk bazlı skor artışı
                this.score += 1 * this.multiplier;
                i--;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Şerit Çizgileri
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([20, 20]);
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.laneWidth, 0);
        this.ctx.lineTo(this.laneWidth, this.canvas.height);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.laneWidth * 2, 0);
        this.ctx.lineTo(this.laneWidth * 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        if (this.player.img) {
            this.ctx.drawImage(this.player.img, this.player.x - this.player.width / 2, this.player.y, this.player.width, this.player.height);
        }

        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = obs.color;
            this.ctx.fillRect(obs.x - obs.width / 2, obs.y, obs.width, obs.height);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(obs.x - obs.width/2 + 5, obs.y + 10, obs.width - 10, 15);
        });

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
