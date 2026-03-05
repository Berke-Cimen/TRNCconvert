export class BilliardsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        // Initial setup, will be resized based on difficulty
        this.canvas.width = 320; 
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;

        // Physics
        this.balls = [];
        this.cueBallIndex = 0;
        this.friction = 0.985;
        this.wallBounce = 0.7; // Energy loss on cushion
        this.ballRadius = 10;

        // Interaction
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragCurrent = { x: 0, y: 0 };
        this.maxPower = 20;

        // Game State
        this.pockets = [];
        this.pocketRadius = 20; // Varsayılan cep yarıçapı
        this.playerImg = null;
        
        // Difficulty
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        // HTML Elements
        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.charSelectScreen = document.getElementById('character-select');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleRestart = this.handleRestart.bind(this);
        this.handleSaveScore = this.handleSaveScore.bind(this);
        this.gameLoop = this.gameLoop.bind(this);

        this.init();
    }

    init() {
        this.loadCharacters();
        this.addListeners();
    }

    addListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        }, {passive: false});
        
        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
            e.preventDefault();
        }, {passive: false});
        
        window.addEventListener('touchend', this.handleMouseUp);

        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    // --- INPUT ---
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleMouseDown(e) {
        if (!this.isRunning || this.isGameOver) return;
        
        // Only hit if balls stopped
        if (this.balls.some(b => Math.abs(b.vx) > 0.1 || Math.abs(b.vy) > 0.1)) return;

        const pos = this.getMousePos(e);
        const cue = this.balls[this.cueBallIndex];
        
        // Check click near cue ball
        const dist = Math.sqrt(Math.pow(pos.x - cue.x, 2) + Math.pow(pos.y - cue.y, 2));
        
        if (dist < 100) {
            this.isDragging = true;
            this.dragStart = { x: cue.x, y: cue.y };
            this.dragCurrent = pos;
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.dragCurrent = this.getMousePos(e);
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        const dx = this.dragStart.x - this.dragCurrent.x;
        const dy = this.dragStart.y - this.dragCurrent.y;
        
        let power = Math.sqrt(dx*dx + dy*dy) * 0.15;
        // Higher difficulty = more power sensitivity but harder to control max
        if(this.difficulty === 'Hard') power *= 1.2;
        
        const cappedPower = Math.min(power, this.maxPower);
        const angle = Math.atan2(dy, dx);

        const cue = this.balls[this.cueBallIndex];
        cue.vx = Math.cos(angle) * cappedPower;
        cue.vy = Math.sin(angle) * cappedPower;
    }

    // --- LOGIC ---
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

    setupTable() {
        const w = this.canvas.width;

        // Zorluk ayarları
        if (this.difficulty === 'Easy') {
            this.canvas.height = 480;
            this.ballRadius = 10;
            this.friction = 0.98; // Daha çabuk durur
            this.pocketRadius = 25; // Büyük cepler - kolay sokmak
        } else if (this.difficulty === 'Hard') {
            this.canvas.height = 550; // Daha uzun masa
            this.ballRadius = 9;
            this.friction = 0.992; // Daha uzun yuvarlanır
            this.pocketRadius = 15; // Küçük cepler - zor sokmak
        } else {
            // Normal
            this.canvas.height = 480;
            this.ballRadius = 10;
            this.friction = 0.985;
            this.pocketRadius = 20; // Standart cep
        }

        const h = this.canvas.height;

        // Standart 6 cep (köşeler + orta kenarlar)
        this.pockets = [
            {x: 0, y: 0}, {x: w, y: 0},           // Üst köşeler
            {x: 0, y: h}, {x: w, y: h},           // Alt köşeler
            {x: 0, y: h/2}, {x: w, y: h/2}        // Orta kenarlar
        ];

        // Easy modda ekstra cepler ekle (oyunu kolaylaştırır)
        if (this.difficulty === 'Easy') {
            this.pockets.push(
                {x: 0, y: h/4}, {x: w, y: h/4},
                {x: 0, y: 3*h/4}, {x: w, y: 3*h/4}
            );
        }

        // Balls
        this.balls = [];
        
        // Cue Ball
        this.balls.push({
            x: w/2, y: h - 100, vx: 0, vy: 0, color: '#fff', type: 'cue'
        });

        // Rack of balls (Triangle)
        const startX = w/2;
        const startY = 100;
        const rows = 4;
        const br = this.ballRadius;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= row; col++) {
                const x = startX - (row * br) + (col * br * 2) + (Math.random()); // slight offset
                const y = startY + (row * br * 1.8) + (Math.random());
                const color = `hsl(${Math.random()*360}, 70%, 50%)`;
                this.balls.push({
                    x: x, y: y, vx: 0, vy: 0, color: color, type: 'pool'
                });
            }
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

        this.setupTable();
        this.score = 0;
        this.isRunning = true;
        this.isGameOver = false;
        
        this.gameLoop();
    }

    resolveCollision(b1, b2) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < this.ballRadius * 2) {
            // Collision logic
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate velocity
            const vx1 = b1.vx * cos + b1.vy * sin;
            const vy1 = b1.vy * cos - b1.vx * sin;
            const vx2 = b2.vx * cos + b2.vy * sin;
            const vy2 = b2.vy * cos - b2.vx * sin;

            // Elastic collision
            const v1Final = vx2;
            const v2Final = vx1;

            // Update velocity
            const vx1Final = v1Final * cos - vy1 * sin;
            const vy1Final = vy1 * cos + v1Final * sin;
            const vx2Final = v2Final * cos - vy2 * sin;
            const vy2Final = vy2 * cos + v2Final * sin;

            b1.vx = vx1Final;
            b1.vy = vy1Final;
            b2.vx = vx2Final;
            b2.vy = vy2Final;

            // Separation (overlap fix)
            const overlap = (this.ballRadius * 2 - dist) / 2;
            b1.x -= overlap * Math.cos(angle);
            b1.y -= overlap * Math.sin(angle);
            b2.x += overlap * Math.cos(angle);
            b2.y += overlap * Math.sin(angle);
        }
    }

    update() {
        if (this.isGameOver) return;

        // Physics Loop
        for (let i = 0; i < this.balls.length; i++) {
            let b = this.balls[i];
            
            // Move
            b.x += b.vx;
            b.y += b.vy;

            // Friction
            b.vx *= this.friction;
            b.vy *= this.friction;

            if (Math.abs(b.vx) < 0.05) b.vx = 0;
            if (Math.abs(b.vy) < 0.05) b.vy = 0;

            // Wall Collisions
            if (b.x < this.ballRadius) { b.x = this.ballRadius; b.vx *= -this.wallBounce; }
            if (b.x > this.canvas.width - this.ballRadius) { b.x = this.canvas.width - this.ballRadius; b.vx *= -this.wallBounce; }
            if (b.y < this.ballRadius) { b.y = this.ballRadius; b.vy *= -this.wallBounce; }
            if (b.y > this.canvas.height - this.ballRadius) { b.y = this.canvas.height - this.ballRadius; b.vy *= -this.wallBounce; }

            // Pocket Detection
            for (let p of this.pockets) {
                const pd = Math.sqrt(Math.pow(b.x - p.x, 2) + Math.pow(b.y - p.y, 2));
                if (pd < this.pocketRadius) { // Zorluk seviyesine göre cep boyutu
                    // Ball Potted
                    if (b.type === 'cue') {
                        // Foul
                        this.score -= 50; // Penalty
                        // Reset cue ball
                        b.x = this.canvas.width/2;
                        b.y = this.canvas.height - 100;
                        b.vx = 0; b.vy = 0;
                    } else {
                        // Point
                        this.score += 100 * this.multiplier;
                        this.balls.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
        }

        // Ball-Ball Collisions
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.resolveCollision(this.balls[i], this.balls[j]);
            }
        }

        // Win Condition
        if (this.balls.length === 1 && this.balls[0].type === 'cue') {
            this.gameOver();
        }
    }

    draw() {
        // Table Felt
        this.ctx.fillStyle = '#27ae60'; // Pool green
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Character Watermark
        if (this.playerImg && this.playerImg.complete) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.15;
            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
            // Rotate slowly? No, distracting.
            const size = 200;
            this.ctx.drawImage(this.playerImg, -size/2, -size/2, size, size);
            this.ctx.restore();
        }

        // Pockets
        this.ctx.fillStyle = '#111';
        this.pockets.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.pocketRadius, 0, Math.PI*2);
            this.ctx.fill();
        });

        // Balls
        this.balls.forEach(b => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, this.ballRadius, 0, Math.PI*2);
            
            if (b.type === 'cue') {
                this.ctx.fillStyle = '#ecf0f1';
                this.ctx.fill();
                // Draw Character Face on Cue Ball
                if (this.playerImg && this.playerImg.complete) {
                    this.ctx.clip();
                    this.ctx.drawImage(this.playerImg, b.x - this.ballRadius, b.y - this.ballRadius, this.ballRadius*2, this.ballRadius*2);
                }
            } else {
                // Colored Pool Balls
                this.ctx.fillStyle = b.color;
                this.ctx.fill();
                // Shine
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.beginPath();
                this.ctx.arc(b.x - 3, b.y - 3, 3, 0, Math.PI*2);
                this.ctx.fill();
            }
            this.ctx.restore();
            
            // Border
            this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, this.ballRadius, 0, Math.PI*2);
            this.ctx.stroke();
        });

        // Aim Line
        if (this.isDragging && this.balls.length > 0) {
            const cue = this.balls[this.cueBallIndex];
            if(cue) {
                this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(cue.x, cue.y);
                this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Aim Assist (Easy Only)
                if (this.difficulty === 'Easy') {
                    const dx = this.dragStart.x - this.dragCurrent.x;
                    const dy = this.dragStart.y - this.dragCurrent.y;
                    const angle = Math.atan2(dy, dx);
                    
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(cue.x, cue.y);
                    this.ctx.lineTo(cue.x + Math.cos(angle)*100, cue.y + Math.sin(angle)*100);
                    this.ctx.stroke();
                }
            }
        }

        // Score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Puan: ${this.score}`, 10, 30);
    }

    gameLoop() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop);
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.scoreDisplay.innerText = this.score;
        this.gameOverScreen.style.display = 'flex';
    }

    handleRestart() {
        if(this.playerImg) this.startGame(this.playerImg.src);
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
                gameName: 'BilliardsGame',
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
}