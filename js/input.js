/**
 * Neon Pool Challenge - Input Manager
 * Manages mouse/touch interactions.
 */

const Input = {
    x: 0,
    y: 0,
    isDown: false,
    
    init(canvas) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.clientX - rect.left;
            this.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mousedown', () => {
            this.isDown = true;
        });

        canvas.addEventListener('mouseup', () => {
            this.isDown = false;
        });

        // Touch support
        canvas.addEventListener('touchmove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.touches[0].clientX - rect.left;
            this.y = e.touches[0].clientY - rect.top;
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchstart', (e) => {
            this.isDown = true;
            e.preventDefault();
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            this.isDown = false;
            e.preventDefault();
        }, { passive: false });
    }
};
