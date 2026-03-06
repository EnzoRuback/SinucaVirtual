/**
 * Neon Pool Challenge - Physics engine
 * Handles collision detection and response for circles and bounds.
 */

const Physics = {
    // Resolve ball-to-ball collision
    resolveCollision(b1, b2) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const distSq = dx * dx + dy * dy;
        const minDistance = b1.radius + b2.radius;

        if (distSq < minDistance * minDistance) {
            const dist = Math.sqrt(distSq) || 1; // Prevent div by zero
            
            // 1. Static Collision Resolution (Unstacking)
            const overlap = (minDistance - dist) / 2;
            const nx = dx / dist; // Normalized Normal Vector X
            const ny = dy / dist; // Normalized Normal Vector Y

            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            // 2. Dynamic Collision Resolution (Elastic Impact)
            // Relative velocity
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;

            // Dot product (velocity along normal)
            const velAlongNormal = rvx * nx + rvy * ny;

            // Do not resolve if velocities are separating
            if (velAlongNormal > 0) return;

            // Restitution (elasticity) - 1.0 for perfect elastic neon feel
            const e = 1.0; 

            // Impulse scalar
            let j = -(1 + e) * velAlongNormal;
            j /= (1 / b1.mass + 1 / b2.mass);

            // Apply impulse
            const impulseX = j * nx;
            const impulseY = j * ny;

            b1.vx -= (1 / b1.mass) * impulseX;
            b1.vy -= (1 / b1.mass) * impulseY;
            b2.vx += (1 / b2.mass) * impulseX;
            b2.vy += (1 / b2.mass) * impulseY;
        }
    },

    // Resolve table boundary collision
    handleBounds(ball, tableRect) {
        const { x, y, width, height } = tableRect;
        const wallRestitution = 0.8; // Lose a bit of energy hitting walls

        if (ball.x - ball.radius < x) {
            ball.x = x + ball.radius;
            ball.vx *= -wallRestitution;
        } else if (ball.x + ball.radius > x + width) {
            ball.x = x + width - ball.radius;
            ball.vx *= -wallRestitution;
        }

        if (ball.y - ball.radius < y) {
            ball.y = y + ball.radius;
            ball.vy *= -wallRestitution;
        } else if (ball.y + ball.radius > y + height) {
            ball.y = y + height - ball.radius;
            ball.vy *= -wallRestitution;
        }
    },

    // Check if ball fell in pocket
    checkPocket(ball, pockets) {
        for (const pocket of pockets) {
            const dx = ball.x - pocket.x;
            const dy = ball.y - pocket.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < pocket.radius * pocket.radius) {
                return true;
            }
        }
        return false;
    }
};
