export class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;

        this.gridSize = 20;
        this.tileCountX = this.canvas.width / this.gridSize;
        this.tileCountY = this.canvas.height / this.gridSize;

        this.isRunning = false;
        this.isGameOver = false;
        this.score = 0;

        // Difficulty Settings
        this.difficulty = "Normal";
        this.multiplier = 1.5;
        this.gameSpeed = 100; // Milliseconds per frame (lower is faster)

        this.snake = [];
        this.velocity = { x: 0, y: 0 };
        this.food = { x: 5, y: 5 };
        
        this.playerImg = null;

        // HTML Elements
        this.gameOverScreen = document.getElementById('game-over');
        this.scoreDisplay = document.getElementById('final-score');
        this.charSelectScreen = document.getElementById('character-select');
        this.canvasWrapper = document.getElementById('canvas-wrapper');
        this.usernameInput = document.getElementById('game-username');
        this.leaderboardSection = document.getElementById("leaderboard-section");
        this.leaderboardBody = document.getElementById("leaderboard-body");

        this.handleKeyDown = this.handleKeyDown.bind(this);
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
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {passive: false});

        document.getElementById('btn-restart').addEventListener('click', this.handleRestart);
        document.getElementById('btn-save-score').addEventListener('click', this.handleSaveScore);
    }

    removeListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        const r = document.getElementById('btn-restart'); if(r) r.removeEventListener('click', this.handleRestart);
        const s = document.getElementById('btn-save-score'); if(s) s.removeEventListener('click', this.handleSaveScore);
    }

    destroy() {
        this.isRunning = false;
        this.removeListeners();
    }

    // --- INPUT HANDLING ---
    handleKeyDown(e) {
        if (!this.isRunning) return;
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                if (this.velocity.x !== 1) this.velocity = { x: -1, y: 0 };
                break;
            case 'ArrowUp':
            case 'w':
                if (this.velocity.y !== 1) this.velocity = { x: 0, y: -1 };
                break;
            case 'ArrowRight':
            case 'd':
                if (this.velocity.x !== -1) this.velocity = { x: 1, y: 0 };
                break;
            case 'ArrowDown':
            case 's':
                if (this.velocity.y !== -1) this.velocity = { x: 0, y: 1 };
                break;
        }
    }

    handleTouchStart(evt) {
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
    }

    handleTouchMove(evt) {
        if (!this.xDown || !this.yDown || !this.isRunning) return;
        evt.preventDefault();

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;
        const xDiff = this.xDown - xUp;
        const yDiff = this.yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) { // Left
                if (this.velocity.x !== 1) this.velocity = { x: -1, y: 0 };
            } else { // Right
                if (this.velocity.x !== -1) this.velocity = { x: 1, y: 0 };
            }
        } else {
            if (yDiff > 0) { // Up
                if (this.velocity.y !== 1) this.velocity = { x: 0, y: -1 };
            } else { // Down
                if (this.velocity.y !== -1) this.velocity = { x: 0, y: 1 };
            }
        }
        this.xDown = null;
        this.yDown = null;
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
                    
                    // Set Speed based on Difficulty
                    if(this.difficulty === 'Easy') this.gameSpeed = 150;
                    else if(this.difficulty === 'Normal') this.gameSpeed = 100;
                    else if(this.difficulty === 'Hard') this.gameSpeed = 60;

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

        // Reset State
        this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; // Head + 2 body parts
        this.velocity = { x: 1, y: 0 }; // Start moving right
        this.score = 0;
        this.isRunning = true;
        this.isGameOver = false;
        
        this.placeFood();
        this.gameLoop();
    }

    placeFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCountX),
            y: Math.floor(Math.random() * this.tileCountY)
        };
        // Ensure food doesn't spawn on snake
        for(let part of this.snake) {
            if(part.x === this.food.x && part.y === this.food.y) {
                this.placeFood(); // Try again
                break;
            }
        }
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        setTimeout(this.gameLoop, this.gameSpeed);
    }

    update() {
        if (this.isGameOver) return;

        // Calculate new head position
        const head = { x: this.snake[0].x + this.velocity.x, y: this.snake[0].y + this.velocity.y };

        // 1. Check Wall Collision
        if (head.x < 0 || head.x >= this.tileCountX || head.y < 0 || head.y >= this.tileCountY) {
            return this.gameOver();
        }

        // 2. Check Self Collision
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return this.gameOver();
            }
        }

        // Move Snake
        this.snake.unshift(head); // Add new head

        // 3. Check Food
        if (head.x === this.food.x && head.y === this.food.y) {
            // Ate food
            this.score += 10 * this.multiplier;
            this.placeFood();
            // Don't pop tail (grow)
        } else {
            this.snake.pop(); // Remove tail (move)
        }
    }

    draw() {
        // Clear Screen
        this.ctx.fillStyle = '#1e272e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Food
        this.ctx.fillStyle = '#ff4757';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#ff4757";
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2, 
            this.food.y * this.gridSize + this.gridSize/2, 
            this.gridSize/2 - 2, 0, Math.PI*2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw Snake
        for (let i = 0; i < this.snake.length; i++) {
            let part = this.snake[i];
            let px = part.x * this.gridSize;
            let py = part.y * this.gridSize;

            if (i === 0 && this.playerImg && this.playerImg.complete) {
                // Draw Character Head
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(px + this.gridSize/2, py + this.gridSize/2, this.gridSize/2 + 2, 0, Math.PI*2);
                this.ctx.clip();
                this.ctx.drawImage(this.playerImg, px, py, this.gridSize, this.gridSize);
                this.ctx.restore();
                // Head Border
                this.ctx.strokeStyle = '#00eaff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else {
                // Draw Body
                // Color gradient based on index
                this.ctx.fillStyle = i % 2 === 0 ? '#2ed573' : '#7bed9f';
                this.ctx.fillRect(px, py, this.gridSize, this.gridSize);
                // Inner Detail
                this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
                this.ctx.fillRect(px + 2, py + 2, this.gridSize - 4, this.gridSize - 4);
            }
        }

        // Score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Skor: ${this.score}`, 10, 30);
    }

    gameOver() {
        this.isRunning = false;
        this.isGameOver = true;
        this.scoreDisplay.innerText = Math.floor(this.score);
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
                score: Math.floor(this.score), 
                gameName: 'SnakeGame',
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