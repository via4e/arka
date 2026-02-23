/**
 * Paddle Entity (Vaus)
 * Player-controlled paddle at the bottom of the screen
 */

import { CONFIG } from './constants.js';

export class Paddle {
    constructor() {
        this.width = CONFIG.PADDLE.WIDTH;
        this.height = CONFIG.PADDLE.HEIGHT;
        this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.PADDLE.Y_POSITION;
        this.speed = CONFIG.PADDLE.SPEED;
        this.baseWidth = this.width;
        this.color = CONFIG.PADDLE.COLOR;
        this.borderColor = CONFIG.PADDLE.BORDER_COLOR;
        this.hasLaser = false;
        this.laserTimer = 0;
    }
    
    /**
     * Reset paddle to default state
     */
    reset() {
        this.width = this.baseWidth;
        this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
        this.hasLaser = false;
        this.laserTimer = 0;
    }
    
    /**
     * Move paddle based on direction
     * @param {number} direction - -1 for left, 1 for right, 0 for none
     * @param {number} deltaTime - Time since last frame in seconds
     */
    move(direction, deltaTime) {
        if (direction === 0) return;
        
        this.x += direction * this.speed * deltaTime;
        
        // Clamp to screen bounds
        this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
    }
    
    /**
     * Move paddle to specific X position (for mouse control)
     * @param {number} targetX - Target X position (center of paddle)
     */
    moveTo(targetX) {
        this.x = targetX - this.width / 2;
        
        // Clamp to screen bounds
        this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
    }
    
    /**
     * Extend paddle width (power-up effect)
     * @param {number} duration - Duration in milliseconds
     */
    extend(duration) {
        this.width = this.baseWidth * 1.5;
        
        // Schedule return to normal size
        setTimeout(() => {
            this.width = this.baseWidth;
            // Re-center if needed
            this.x = Math.min(this.x, CONFIG.CANVAS_WIDTH - this.width);
        }, duration);
    }
    
    /**
     * Enable laser power-up
     * @param {number} duration - Duration in milliseconds
     */
    enableLaser(duration) {
        this.hasLaser = true;
        this.laserTimer = duration;
    }
    
    /**
     * Update paddle state
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        if (this.hasLaser) {
            this.laserTimer -= deltaTime;
            if (this.laserTimer <= 0) {
                this.hasLaser = false;
            }
        }
    }
    
    /**
     * Get the relative hit position on the paddle (-1 to 1)
     * @param {number} ballX - Ball X position
     * @returns {number} - Normalized position (-1 = left edge, 0 = center, 1 = right edge)
     */
    getHitPosition(ballX) {
        const relativeX = (ballX - this.x) / this.width;
        return (relativeX - 0.5) * 2; // Convert to -1 to 1 range
    }
    
    /**
     * Get paddle bounding box
     * @returns {object} - {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Get laser positions (for shooting)
     * @returns {Array} - Array of {x, y} positions for laser beams
     */
    getLaserPositions() {
        if (!this.hasLaser) return [];
        
        return [
            { x: this.x + 5, y: this.y },
            { x: this.x + this.width - 5, y: this.y }
        ];
    }
    
    /**
     * Render the paddle
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        ctx.save();
        
        // Main paddle body (metallic gradient effect)
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#E0E0E0');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#808080');
        
        ctx.fillStyle = gradient;
        
        // Draw paddle with rounded corners (pixel art style)
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Decorative lines for retro look
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 5, this.y + 3, this.width - 10, 2);
        ctx.fillRect(this.x + 5, this.y + this.height - 5, this.width - 10, 2);
        
        // Laser indicators
        if (this.hasLaser) {
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(this.x + 3, this.y - 4, 4, 4);
            ctx.fillRect(this.x + this.width - 7, this.y - 4, 4, 4);
            
            // Blinking effect
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(this.x + 3, this.y - 4, 4, 4);
                ctx.fillRect(this.x + this.width - 7, this.y - 4, 4, 4);
            }
        }
        
        ctx.restore();
    }
}
