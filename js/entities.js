/**
 * Neon Pool Challenge - Entities
 * Defines the core game objects with their drawing and basic state logic.
 */

class Ball {
    constructor(x, y, radius, color, isWhite = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.isWhite = isWhite;
        this.mass = radius; // Simplified mass based on size
        this.friction = 0.985;
        this.inGame = true;
    }

    update(dt) {
        if (!this.inGame) return;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Stop if speed is very low
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        if (!this.inGame) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Neon Glow Effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();

        // Subtle highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        
        ctx.restore();
    }
}

class Cue {
    constructor(whiteBall) {
        this.whiteBall = whiteBall;
        this.angle = 0;
        this.distance = 0;
        this.isDragging = false;
        this.maxLength = 200;
        this.power = 0;
    }

    update(mouseX, mouseY) {
        const dx = mouseX - this.whiteBall.x;
        const dy = mouseY - this.whiteBall.y;
        this.angle = Math.atan2(dy, dx);
        
        if (this.isDragging) {
            const dragDist = Math.sqrt(dx*dx + dy*dy);
            this.power = Math.min(dragDist, this.maxLength);
        } else {
            this.power = 0;
        }
    }

    draw(ctx) {
        if (this.whiteBall.vx !== 0 || this.whiteBall.vy !== 0 || !this.whiteBall.inGame) return;

        ctx.save();
        ctx.translate(this.whiteBall.x, this.whiteBall.y);
        ctx.rotate(this.angle);

        // Draw Aiming Line (Dotted)
        ctx.beginPath();
        ctx.setLineDash([5, 10]);
        ctx.moveTo(0, 0);
        ctx.lineTo(800, 0); // Large distance for aiming
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Cue Stick
        const cueLength = 300;
        const offset = 20 + this.power;
        
        let grad = ctx.createLinearGradient(offset, 0, offset + cueLength, 0);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, 'rgba(0, 255, 204, 0.1)');

        ctx.beginPath();
        ctx.moveTo(offset, -4);
        ctx.lineTo(offset + cueLength, -2);
        ctx.lineTo(offset + cueLength, 2);
        ctx.lineTo(offset, 4);
        ctx.closePath();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffcc';
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
    }
}

class Pocket {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();
        
        // Inner rim
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}
