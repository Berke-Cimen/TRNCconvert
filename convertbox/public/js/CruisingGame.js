// public/js/CruisingGame.js

export class CruisingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;
        this.baseSpeed = 4;
        this.roadOffset = 0;

        this.difficulty = "Normal";
        this.multiplier = 1.5;

        this.laneWidth = 200 / 3;
        this.roadX = 60;
        this.lanes = [
            this.roadX + this.laneWidth / 2,                
            this.roadX + this.laneWidth + this.laneWidth / 2, 
            this.roadX + (this.laneWidth * 2) + this.laneWidth / 2 
        ];
        this.currentLane = 1;

        this.player = {
            x: this.lanes[1],
            y: this.canvas.height - 100,
            width: 40,
            height: 60,
            img: null
        };

        this.objects = [];
        this.spawnTimer = 0;

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
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
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
        if (e.clientX - rect.left < this.canvas.width / 2) this.moveLane(-1);
        else this.moveLane(1);
    }

    handleRestart() {
        if(this.player.img) this.startGame(this.player.img.src);
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
                gameName: 'CruisingGame',
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
        this.player.x = this.lanes[1];
        this.currentLane = 1;

        this.score = 0;
        this.currentSpeed = this.baseSpeed * (this.multiplier === 1 ? 0.8 : (this.multiplier === 2 ? 1.3 : 1));
        this.objects = [];
        this.isRunning = true;
        this.isGameOver = false;

        this.loop();
    }

    spawnObject() {
        const laneIndex = Math.floor(Math.random() * 3);
        const type = Math.random() > 0.4 ? 'coin' : 'barrier'; 
        
        const obj = {
            x: this.lanes[laneIndex],
            y: -50,
            width: 30,
            height: 30,
            type: type,
            lane: laneIndex
        };
        this.objects.push(obj);
    }

    update() {
        if (this.isGameOver) return;
        this.roadOffset += this.currentSpeed;
        if (this.roadOffset > 40) this.roadOffset = 0;
        
        // Spawn rate zorluğa göre
        let rate = 50 / (this.multiplier || 1.5);
        this.spawnTimer++;
        if (this.spawnTimer > rate) {
            this.spawnObject();
            this.spawnTimer = 0;
        }

        for (let i = 0; i < this.objects.length; i++) {
            let obj = this.objects[i];
            obj.y += this.currentSpeed;

            const pLeft = this.player.x - this.player.width/2 + 10;
            const pRight = this.player.x + this.player.width/2 - 10;
            const pTop = this.player.y + 10;
            const pBottom = this.player.y + this.player.height - 10;

            const oLeft = obj.x - obj.width/2 + 5;
            const oRight = obj.x + obj.width/2 - 5;
            const oTop = obj.y + 5;
            const oBottom = obj.y + obj.height - 5;

            if (pLeft < oRight && pRight > oLeft && pTop < oBottom && pBottom > oTop) {
                if (obj.type === 'barrier') {
                    this.gameOver();
                } else if (obj.type === 'coin') {
                    // Coin değeri zorlukla artar
                    this.score += 10 * this.multiplier; 
                    this.objects.splice(i, 1);
                    i--;
                    continue; 
                }
            }

            if (obj.y > this.canvas.height) {
                this.objects.splice(i, 1);
                i--;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#4CAF50'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(this.roadX, 0, 200, this.canvas.height);

        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.roadX, 0);
        this.ctx.lineTo(this.roadX, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.roadX + 200, 0);
        this.ctx.lineTo(this.roadX + 200, this.canvas.height);
        this.ctx.stroke();

        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]);
        this.ctx.lineDashOffset = -this.roadOffset; 

        this.ctx.beginPath();
        this.ctx.moveTo(this.roadX + 66, 0);
        this.ctx.lineTo(this.roadX + 66, this.canvas.height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.roadX + 133, 0);
        this.ctx.lineTo(this.roadX + 133, this.canvas.height);
        this.ctx.stroke();

        this.ctx.setLineDash([]);

        if (this.player.img) {
            this.ctx.drawImage(this.player.img, this.player.x - this.player.width / 2, this.player.y, this.player.width, this.player.height);
        }

        this.objects.forEach(obj => {
            if (obj.type === 'barrier') {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(obj.x - obj.width/2, obj.y, obj.width, obj.height);
                this.ctx.fillStyle = '#c0392b';
                this.ctx.fillRect(obj.x - obj.width/2 + 5, obj.y + 5, obj.width - 10, obj.height - 10);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(obj.x, obj.y + obj.height/2, 15, 0, Math.PI * 2);
                this.ctx.fillStyle = '#f1c40f';
                this.ctx.fill();
                this.ctx.strokeStyle = '#f39c12';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                this.ctx.fillStyle = '#000';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('$', obj.x, obj.y + obj.height/2);
            }
        });

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Puan: ${Math.floor(this.score)}`, 20, 40);
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
