/**
 * Enemy Entity
 * Floating obstacles that appear periodically and interfere with gameplay
 */

import { CONFIG } from './constants.js';

export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.ENEMY.WIDTH;
        this.height = CONFIG.ENEMY.HEIGHT;
        this.speed = CONFIG.ENEMY.SPEED;
        this.dx = this.speed;
        this.dy = 0;
        this.active = true;
        this.visible = true;
        this.appearTime = Date.now();
        this.disappearTime = null;
        this.direction = 1;
        
        // Animation state
        this.animationFrame = 0;
        this.animationTimer = 0;
    }
    
    /**
     * Reset enemy for reuse
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.dx = this.speed;
        this.dy = 0;
        this.active = true;
        this.visible = false;
        this.appearTime = Date.now();
        this.disappearTime = null;
        this.direction = 1;
    }
    
    /**
     * Make enemy appear
     */
    appear() {
        this.visible = true;
        this.appearTime = Date.now();
        // Stay for 15-25 seconds randomly
        this.disappearTime = this.appearTime + 15000 + Math.random() * 10000;
    }
    
    /**
     * Make enemy disappear
     */
    disappear() {
        this.visible = false;
        this.disappearTime = null;
    }
    
    /**
     * Check if enemy should appear
     * @returns {boolean}
     */
    shouldAppear() {
        return !this.visible && Date.now() - this.appearTime >= CONFIG.ENEMY.APPEAR_DELAY;
    }
    
    /**
     * Check if enemy should disappear
     * @returns {boolean}
     */
    shouldDisappear() {
        return this.visible && this.disappearTime && Date.now() >= this.disappearTime;
    }
    
    /**
     * Update enemy state and position
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (!this.visible) {
            // Check if should appear
            if (this.shouldAppear()) {
                this.appear();
            }
            return;
        }
        
        // Check if should disappear
        if (this.shouldDisappear()) {
            this.disappear();
            return;
        }
        
        // Move horizontally
        this.x += this.dx * deltaTime;
        
        // Bounce off walls
        if (this.x <= 0) {
            this.x = 0;
            this.dx = Math.abs(this.dx);
            this.direction = 1;
        } else if (this.x + this.width >= CONFIG.CANVAS_WIDTH) {
            this.x = CONFIG.CANVAS_WIDTH - this.width;
            this.dx = -Math.abs(this.dx);
            this.direction = -1;
        }
        
        // Update animation
        this.animationTimer += deltaTime * 1000;
        if (this.animationTimer > 200) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }
    
    /**
     * Hit by laser
     * @returns {boolean} - True if destroyed
     */
    hit() {
        this.active = false;
        return true;
    }
    
    /**
     * Deflect ball in random direction
     * @param {object} ball - Ball object to deflect
     */
    deflectBall(ball) {
        if (!this.visible || !ball.active) return;
        
        // Random angle between 30-60 degrees
        const angle = (30 + Math.random() * 30) * (Math.PI / 180);
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        ball.dx = Math.sin(angle) * ball.speed * direction;
        ball.dy = -Math.abs(Math.cos(angle) * ball.speed);
    }
    
    /**
     * Get enemy bounding box
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
     * Check collision with laser beam
     * @param {number} laserX - Laser X position
     * @param {number} laserY - Laser Y position
     * @returns {boolean}
     */
    checkLaserCollision(laserX, laserY) {
        if (!this.visible) return false;
        
        return (
            laserX >= this.x &&
            laserX <= this.x + this.width &&
            laserY >= this.y &&
            laserY <= this.y + this.height
        );
    }
    
    /**
     * Check collision with ball
     * @param {object} ball - Ball object
     * @returns {boolean}
     */
    checkBallCollision(ball) {
        if (!this.visible) return false;
        
        const ballBounds = ball.getBounds();
        return (
            this.x < ballBounds.x + ballBounds.width &&
            this.x + this.width > ballBounds.x &&
            this.y < ballBounds.y + ballBounds.height &&
            this.y + this.height > ballBounds.y
        );
    }
    
    /**
     * Render the enemy
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        if (!this.visible) return;
        
        ctx.save();
        
        // Blink effect when about to disappear
        if (this.disappearTime && Date.now() > this.disappearTime - 3000) {
            if (Math.floor(Date.now() / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }
        
        // Main body (alien-like shape)
        ctx.fillStyle = CONFIG.ENEMY.COLOR;
        
        // Draw pixel-art style enemy
        const w = this.width;
        const h = this.height;
        const x = this.x;
        const y = this.y;
        
        // Body
        ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.5);
        
        // Top spikes (animated)
        if (this.animationFrame % 2 === 0) {
            ctx.fillRect(x + w * 0.1, y, w * 0.2, h * 0.2);
            ctx.fillRect(x + w * 0.7, y, w * 0.2, h * 0.2);
        } else {
            ctx.fillRect(x + w * 0.15, y, w * 0.15, h * 0.25);
            ctx.fillRect(x + w * 0.7, y, w * 0.15, h * 0.25);
        }
        
        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(x + w * 0.3, y + h * 0.3, w * 0.15, h * 0.15);
        ctx.fillRect(x + w * 0.55, y + h * 0.3, w * 0.15, h * 0.15);
        
        // Bottom tentacles (animated)
        ctx.fillStyle = CONFIG.ENEMY.COLOR;
        const tentacleOffset = this.animationFrame % 2 === 0 ? 0 : h * 0.1;
        ctx.fillRect(x + w * 0.1, y + h * 0.7 + tentacleOffset, w * 0.2, h * 0.3 - tentacleOffset);
        ctx.fillRect(x + w * 0.4, y + h * 0.75, w * 0.2, h * 0.25);
        ctx.fillRect(x + w * 0.7, y + h * 0.7 + tentacleOffset, w * 0.2, h * 0.3 - tentacleOffset);
        
        // Outline
        ctx.strokeStyle = '#FF6666';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        
        ctx.restore();
    }
}
