/**
 * Neon Pool Challenge - Main Controller
 * Handles the game loop, input events, and state management.
 */

const Game = {
    canvas: null,
    ctx: null,
    balls: [],
    whiteBall: null,
    cue: null,
    pockets: [],
    tableRect: { x: 50, y: 50, width: 800, height: 400 },
    ballsRemaining: 7,
    isInitialized: false,
    
    // Mouse tracking
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,

    async init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup Resize
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Setup Input
        this.setupInput();

        // Create Table
        this.resetGame();

        // Start Loop
        this.loop();
        this.isInitialized = true;
        
        console.log("Neon Pool Challenge Initialized!");
    },

    resize() {
        // We fix a virtual resolution for the table for consistent physics
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Center the table rect based on screen
        this.tableRect.x = (this.canvas.width - this.tableRect.width) / 2;
        this.tableRect.y = (this.canvas.height - this.tableRect.height) / 2;

        // Position Pockets
        const { x, y, width, height } = this.tableRect;
        const pr = 22; // Pocket radius
        this.pockets = [
            new Pocket(x, y, pr),
            new Pocket(x + width/2, y, pr),
            new Pocket(x + width, y, pr),
            new Pocket(x, y + height, pr),
            new Pocket(x + width/2, y + height, pr),
            new Pocket(x + width, y + height, pr)
        ];
    },

    resetGame() {
        const { x, y, width, height } = this.tableRect;
        const ballRadius = 12;
        
        this.balls = [];
        this.ballsRemaining = 7;
        document.getElementById('score').innerText = `Bolas Restantes: ${this.ballsRemaining}`;

        // Add White Ball
        this.whiteBall = new Ball(x + width * 0.25, y + height / 2, ballRadius, '#ffffff', true);
        this.balls.push(this.whiteBall);

        // Add Colored Balls in Triangle Shape
        const colors = ['#ff00ff', '#00ffcc', '#ffff00', '#ff0000', '#0000ff', '#ff8800', '#8800ff'];
        const startX = x + width * 0.7;
        const startY = y + height / 2;
        
        let colorIdx = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j <= i; j++) {
                const bx = startX + i * (ballRadius * 2);
                const by = startY + (j - i/2) * (ballRadius * 2);
                this.balls.push(new Ball(bx, by, ballRadius, colors[colorIdx++]));
            }
        }

        this.cue = new Cue(this.whiteBall);
    },

    setupInput() {
        Input.init(this.canvas);
        
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    },

    update(dt) {
        // Handle input for shooting
        if (this.whiteBall.vx === 0 && this.whiteBall.vy === 0) {
            this.mouseX = Input.x;
            this.mouseY = Input.y;
            this.mouseDown = Input.isDown;
            
            // Check for shoot (release)
            if (!this.mouseDown && this.cue.isDragging) {
                const dx = this.mouseX - this.whiteBall.x;
                const dy = this.mouseY - this.whiteBall.y;
                const angle = Math.atan2(dy, dx);
                
                const powerFac = 0.5;
                this.whiteBall.vx = -Math.cos(angle) * this.cue.power * powerFac;
                this.whiteBall.vy = -Math.sin(angle) * this.cue.power * powerFac;
                
                this.cue.isDragging = false;
            } else if (this.mouseDown && !this.cue.isDragging) {
                this.cue.isDragging = true;
            }
        }
        // Update physics
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            if (!ball.inGame) continue;
            
            ball.update(dt);
            Physics.handleBounds(ball, this.tableRect);

            // Check Pocket
            if (Physics.checkPocket(ball, this.pockets)) {
                if (ball.isWhite) {
                    // Foul: Reset white ball position
                    ball.vx = 0; ball.vy = 0;
                    ball.x = this.tableRect.x + this.tableRect.width * 0.25;
                    ball.y = this.tableRect.y + this.tableRect.height / 2;
                } else {
                    ball.inGame = false;
                    this.ballsRemaining--;
                    document.getElementById('score').innerText = `Bolas Restantes: ${this.ballsRemaining}`;
                    if (this.ballsRemaining === 0) alert("VOCÊ VENCEU!");
                }
            }

            // Ball-Ball Collisions
            for (let j = i + 1; j < this.balls.length; j++) {
                const ball2 = this.balls[j];
                if (!ball2.inGame) continue;
                Physics.resolveCollision(ball, ball2);
            }
        }

        // Update Cue
        this.cue.update(this.mouseX, this.mouseY);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Table (Mesa)
        const { x, y, width, height } = this.tableRect;
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.lineWidth = 10;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffcc';
        this.ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
        this.ctx.shadowBlur = 0;

        // Draw Pockets
        this.pockets.forEach(p => p.draw(this.ctx));

        // Draw Balls
        this.balls.forEach(b => b.draw(this.ctx));

        // Draw Cue
        this.cue.draw(this.ctx);
    },

    loop() {
        const dt = 1.0; // Fixed timestep for stability
        this.update(dt);
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
};

// Start the game
window.onload = () => Game.init();
