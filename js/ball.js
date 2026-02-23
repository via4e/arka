/**
 * Ball Entity
 * Represents the game ball with physics and rendering
 */

import { CONFIG, BALL_STATES } from './constants.js';

export class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.BALL.SIZE;
        this.baseSpeed = CONFIG.BALL.BASE_SPEED;
        this.speed = this.baseSpeed;
        this.dx = 0;
        this.dy = 0;
        this.state = BALL_STATES.ATTACHED;
        this.trail = [];
        this.maxTrailLength = 10;
        this.active = true;
    }
    
    /**
     * Reset ball to attached state on paddle
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.speed = this.baseSpeed;
        this.state = BALL_STATES.ATTACHED;
        this.trail = [];
        this.active = true;
    }
    
    /**
     * Launch the ball with an angle
     * @param {number} angle - Launch angle in radians
     */
    launch(angle) {
        if (this.state !== BALL_STATES.ATTACHED) return;
        
        this.state = BALL_STATES.LAUNCHED;
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.cos(angle) * this.speed;
    }
    
    /**
     * Launch straight up
     */
    launchStraight() {
        this.launch(0);
    }
    
    /**
     * Update ball physics
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        if (this.state !== BALL_STATES.LAUNCHED) return;
        
        // Store trail position
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Move ball
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        
        // Wall collisions
        if (this.x <= this.size / 2) {
            this.x = this.size / 2;
            this.dx = Math.abs(this.dx);
        } else if (this.x >= CONFIG.CANVAS_WIDTH - this.size / 2) {
            this.x = CONFIG.CANVAS_WIDTH - this.size / 2;
            this.dx = -Math.abs(this.dx);
        }
        
        if (this.y <= this.size / 2) {
            this.y = this.size / 2;
            this.dy = Math.abs(this.dy);
        }
        
        // Check if ball fell below screen
        if (this.y > CONFIG.CANVAS_HEIGHT + this.size) {
            this.active = false;
        }
    }
    
    /**
     * Set velocity based on angle and speed
     * @param {number} angle - Angle in radians (0 = straight up)
     */
    setVelocityAngle(angle) {
        this.dx = Math.sin(angle) * this.speed;
        this.dy = -Math.cos(angle) * this.speed;
    }
    
    /**
     * Increase ball speed
     * @param {number} multiplier - Speed multiplier
     */
    increaseSpeed(multiplier) {
        const currentAngle = Math.atan2(this.dy, this.dx);
        this.speed = Math.min(this.speed * multiplier, CONFIG.BALL.MAX_SPEED);
        this.dx = Math.sin(currentAngle + Math.PI / 2) * this.speed;
        this.dy = -Math.cos(currentAngle + Math.PI / 2) * this.speed;
    }
    
    /**
     * Get ball bounding box
     * @returns {object} - {x, y, width, height}
     */
    getBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
    
    /**
     * Render the ball
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 0.5;
            const size = this.size * (0.5 + 0.5 * i / this.trail.length);
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.fillRect(
                this.trail[i].x - size / 2,
                this.trail[i].y - size / 2,
                size,
                size
            );
        }
        
        // Draw ball with glow effect
        ctx.save();
        
        // Glow
        ctx.shadowColor = CONFIG.BALL.GLOW_COLOR;
        ctx.shadowBlur = 15;
        
        // Ball body
        ctx.fillStyle = CONFIG.BALL.COLOR;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
        
        ctx.restore();
    }
}
