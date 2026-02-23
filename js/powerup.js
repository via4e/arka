/**
 * PowerUp Entity
 * Falling capsules that grant special abilities
 */

import { CONFIG, POWERUP_STATES, POWERUP_TYPES } from './constants.js';

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.POWERUP.WIDTH;
        this.height = CONFIG.POWERUP.HEIGHT;
        this.type = type;
        this.speed = CONFIG.POWERUP.SPEED;
        this.state = POWERUP_STATES.FALLING;
        this.active = true;
        this.spawnTime = Date.now();
        this.effectApplied = false;
        
        // Set color and letter based on type
        this.initType(type);
    }
    
    /**
     * Initialize power-up properties based on type
     * @param {string} type - Power-up type
     */
    initType(type) {
        switch (type) {
            case POWERUP_TYPES.EXTEND:
                this.color = CONFIG.POWERUP.COLORS.EXTEND;
                this.letter = POWERUP_TYPES.EXTEND;
                break;
            case POWERUP_TYPES.SLOW:
                this.color = CONFIG.POWERUP.COLORS.SLOW;
                this.letter = POWERUP_TYPES.SLOW;
                break;
            case POWERUP_TYPES.MULTIBALL:
                this.color = CONFIG.POWERUP.COLORS.MULTIBALL;
                this.letter = POWERUP_TYPES.MULTIBALL;
                break;
            case POWERUP_TYPES.LASER:
                this.color = CONFIG.POWERUP.COLORS.LASER;
                this.letter = POWERUP_TYPES.LASER;
                break;
            default:
                this.color = '#FFFFFF';
                this.letter = '?';
        }
    }
    
    /**
     * Update power-up position
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (this.state !== POWERUP_STATES.FALLING) return;
        
        this.y += this.speed * deltaTime;
        
        // Deactivate if off screen
        if (this.y > CONFIG.CANVAS_HEIGHT) {
            this.state = POWERUP_STATES.EXPIRED;
            this.active = false;
        }
    }
    
    /**
     * Check collision with paddle
     * @param {object} paddleBounds - Paddle bounding box
     * @returns {boolean}
     */
    checkPaddleCollision(paddleBounds) {
        return (
            this.x < paddleBounds.x + paddleBounds.width &&
            this.x + this.width > paddleBounds.x &&
            this.y < paddleBounds.y + paddleBounds.height &&
            this.y + this.height > paddleBounds.y
        );
    }
    
    /**
     * Get power-up bounding box
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
     * Render the power-up
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Capsule shape
        ctx.fillStyle = this.color;
        
        // Draw rounded capsule
        const radius = this.height / 2;
        ctx.beginPath();
        ctx.arc(this.x + radius, this.y + this.height / 2, radius, Math.PI / 2, Math.PI * 1.5);
        ctx.arc(this.x + this.width - radius, this.y + this.height / 2, radius, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        
        // Inner rectangle
        ctx.fillRect(this.x + radius, this.y, this.width - this.height, this.height);
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(this.x + 3, this.y + 2, this.width - 6, this.height / 2 - 2);
        
        // Letter
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.letter, this.x + this.width / 2, this.y + this.height / 2);
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}
