export class GolfGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;

        // Physics
        this.ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 12, friction: 0.97 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragCurrent = { x: 0, y: 0 };
        this.maxPower = 15;

        // Game State
        this.startTime = 0;
        this.shots = 0;
        
        // Difficulty
        this.difficulty = "Normal";
        this.multiplier = 1.5;

        // Level Data
        this.levels = {}; // Will be populated in init
        this.currentLevel = null;

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
        this.defineLevels();
        this.loadCharacters();
        this.addListeners();
    }

    defineLevels() {
        // Helper to create walls: x, y, width, height
        const W = this.canvas.width;
        const H = this.canvas.height;
        
        this.levels = {
            Easy: [
                // Level 1: Straight Shot
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20}
                ]},
                // Level 2: Simple Center Obstacle
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: W/2-30, y: H/2-30, w: 60, h: 60}
                ]},
                // Level 3: Wide Gap
                { start: {x: 50, y: H-50}, hole: {x: W-50, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 0, y: H/2, w: W/2-40, h: 20}, {x: W/2+40, y: H/2, w: W/2, h: 20}
                ]},
                // Level 4: The Corridor
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 80, h: H}, {x: W-80, y: 0, w: 80, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20}
                ]},
                // Level 5: Corner Pocket
                { start: {x: 50, y: H-50}, hole: {x: W-50, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20}
                ]}
            ],
            Normal: [
                // Level 1: U-Turn
                { start: {x: 50, y: H-50}, hole: {x: W-50, y: H-50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: W/2-10, y: 100, w: 20, h: H}
                ]},
                // Level 2: Zig Zag
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 0, y: H/3, w: W-80, h: 20}, {x: 80, y: 2*H/3, w: W, h: 20}
                ]},
                // Level 3: The Cross
                { start: {x: 50, y: H-50}, hole: {x: W-50, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: W/2-10, y: 100, w: 20, h: H-200}, {x: 50, y: H/2-10, w: W-100, h: 20}
                ]},
                // Level 4: Narrow Gate
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 0, y: H/2, w: W/2-15, h: 20}, {x: W/2+15, y: H/2, w: W/2, h: 20}
                ]},
                // Level 5: Pinball
                { start: {x: 50, y: 240}, hole: {x: W-50, y: 240}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 80, y: 80, w: 40, h: 40}, {x: 200, y: 80, w: 40, h: 40},
                    {x: 80, y: 360, w: 40, h: 40}, {x: 200, y: 360, w: 40, h: 40}
                ]}
            ],
            Hard: [
                // Level 1: The Maze
                { start: {x: 40, y: H-40}, hole: {x: W-40, y: 40}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 20, y: H-100, w: 200, h: 20}, {x: 100, y: H-200, w: 200, h: 20}, {x: 20, y: 100, w: 200, h: 20}
                ]},
                // Level 2: Tiny Box
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 150}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 50, y: 100, w: 10, h: 200}, {x: W-60, y: 100, w: 10, h: 200}, {x: 50, y: 100, w: W-110, h: 10}
                ]},
                // Level 3: Checkerboard
                { start: {x: 40, y: H-40}, hole: {x: W-40, y: 40}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 70, y: 100, w: 40, h: 40}, {x: 170, y: 100, w: 40, h: 40},
                    {x: 120, y: 200, w: 40, h: 40},
                    {x: 70, y: 300, w: 40, h: 40}, {x: 170, y: 300, w: 40, h: 40}
                ]},
                // Level 4: Spiral
                { start: {x: 40, y: 40}, hole: {x: W/2, y: H/2}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 20, y: 80, w: 220, h: 20}, {x: 80, y: 160, w: 220, h: 20}, {x: 20, y: 240, w: 220, h: 20}, {x: 80, y: 320, w: 220, h: 20}
                ]},
                // Level 5: Impossible Gap
                { start: {x: W/2, y: H-50}, hole: {x: W/2, y: 50}, walls: [
                    {x: 0, y: 0, w: 20, h: H}, {x: W-20, y: 0, w: 20, h: H}, {x: 0, y: 0, w: W, h: 20}, {x: 0, y: H-20, w: W, h: 20},
                    {x: 0, y: H/2, w: W/2-8, h: 40}, {x: W/2+8, y: H/2, w: W/2, h: 40}
                ]}
            ]
        };
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

    // --- INPUT HANDLING ---
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
        
        // Only allow shooting if ball is moving very slowly
        const speed = Math.sqrt(this.ball.vx*this.ball.vx + this.ball.vy*this.ball.vy);
        if (speed > 0.5) return;

        const pos = this.getMousePos(e);
        // Check if clicked near ball
        const dist = Math.sqrt(Math.pow(pos.x - this.ball.x, 2) + Math.pow(pos.y - this.ball.y, 2));
        
        if (dist < 100) { // Generous drag area
            this.isDragging = true;
            this.dragStart = { x: this.ball.x, y: this.ball.y };
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
        
        const power = Math.sqrt(dx*dx + dy*dy) * 0.15; // Power multiplier
        const cappedPower = Math.min(power, this.maxPower);
        const angle = Math.atan2(dy, dx);

        this.ball.vx = Math.cos(angle) * cappedPower;
        this.ball.vy = Math.sin(angle) * cappedPower;
        
        if (cappedPower > 0.5) this.shots++;
    }

    // --- GAME LOGIC ---
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
        document.getElementById('btn-save-score').style.display = 'inline-block';

        this.playerImg = new Image();
        this.playerImg.src = imgSrc;

        // Select Level
        const levelSet = this.levels[this.difficulty] || this.levels['Normal'];
        this.currentLevel = levelSet[Math.floor(Math.random() * levelSet.length)];

        // Init State
        this.ball.x = this.currentLevel.start.x;
        this.ball.y = this.currentLevel.start.y;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.startTime = Date.now();
        this.shots = 0;
        
        this.isRunning = true;
        this.isGameOver = false;
        
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        if (this.isGameOver) return;

        // Physics
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Friction
        this.ball.vx *= this.ball.friction;
        this.ball.vy *= this.ball.friction;

        // Stop if slow
        if (Math.abs(this.ball.vx) < 0.05) this.ball.vx = 0;
        if (Math.abs(this.ball.vy) < 0.05) this.ball.vy = 0;

        // Wall Collisions
        const r = this.ball.radius;
        this.currentLevel.walls.forEach(w => {
            // Closest point on rectangle to circle center
            const closestX = Math.max(w.x, Math.min(this.ball.x, w.x + w.w));
            const closestY = Math.max(w.y, Math.min(this.ball.y, w.y + w.h));

            const dx = this.ball.x - closestX;
            const dy = this.ball.y - closestY;
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < r) {
                // Collision detected. Determine simple bounce normal.
                // Overlap amount
                const overlap = r - distance;
                
                // Normalizing
                let nx = dx / distance;
                let ny = dy / distance;
                
                if (distance === 0) { // Inside wall center (rare)
                    nx = 1; ny = 0; 
                }

                // Resolve overlap (push out)
                this.ball.x += nx * overlap;
                this.ball.y += ny * overlap;

                // Reflect velocity
                // V_new = V - 2(V . N)N
                const dot = this.ball.vx * nx + this.ball.vy * ny;
                this.ball.vx = this.ball.vx - 2 * dot * nx;
                this.ball.vy = this.ball.vy - 2 * dot * ny;
                
                // Energy loss on bounce
                this.ball.vx *= 0.8;
                this.ball.vy *= 0.8;
            }
        });

        // Hole Detection
        const h = this.currentLevel.hole;
        const distHole = Math.sqrt(Math.pow(this.ball.x - h.x, 2) + Math.pow(this.ball.y - h.y, 2));
        const speed = Math.sqrt(this.ball.vx*this.ball.vx + this.ball.vy*this.ball.vy);

        if (distHole < 15 && speed < 8) { // Must be close and not too fast
            // Sucked in effect
            this.ball.x += (h.x - this.ball.x) * 0.2;
            this.ball.y += (h.y - this.ball.y) * 0.2;
            this.ball.vx *= 0.5;
            this.ball.vy *= 0.5;

            if (distHole < 5) {
                this.levelComplete();
            }
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#2ecc71'; // Grass
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Pattern for grass
        this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for(let i=0; i<this.canvas.width; i+=40) {
            this.ctx.fillRect(i, 0, 20, this.canvas.height);
        }

        // Draw Walls
        this.ctx.fillStyle = '#8e44ad';
        this.ctx.strokeStyle = '#5e2d73';
        this.ctx.lineWidth = 2;
        this.currentLevel.walls.forEach(w => {
            this.ctx.fillRect(w.x, w.y, w.w, w.h);
            this.ctx.strokeRect(w.x, w.y, w.w, w.h);
        });

        // Draw Hole
        const h = this.currentLevel.hole;
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(h.x, h.y, 14, 0, Math.PI*2);
        this.ctx.fill();

        // Draw Aim Line
        if (this.isDragging) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.x, this.ball.y);
            this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Ball
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
        this.ctx.clip();
        
        if (this.playerImg && this.playerImg.complete) {
            this.ctx.drawImage(this.playerImg, this.ball.x - this.ball.radius, this.ball.y - this.ball.radius, this.ball.radius*2, this.ball.radius*2);
        } else {
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
        }
        this.ctx.restore();
        
        // Ball Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
        this.ctx.stroke();

        // Stats
        const time = ((Date.now() - this.startTime) / 1000).toFixed(1);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`Süre: ${time}s`, 10, 25);
        this.ctx.fillText(`Vuruş: ${this.shots}`, 10, 45);
    }

    levelComplete() {
        this.isRunning = false;
        this.isGameOver = true;
        
        const timeTaken = (Date.now() - this.startTime) / 1000;
        
        // Scoring Formula: 
        // Base points based on time. Faster is better.
        // Cap points.
        // Difficulty multiplier.
        // Penalty for shots count? Maybe.
        
        let baseScore = 5000 / (timeTaken + 1); // e.g. 10s -> ~450
        baseScore = baseScore - (this.shots * 10); // -10 per shot
        
        if (baseScore < 0) baseScore = 0;
        
        this.score = Math.floor(baseScore * this.multiplier);
        
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
                gameName: 'GolfGame',
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