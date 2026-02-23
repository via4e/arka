/**
 * Brick Entity
 * Destructible blocks that form the level patterns
 */

import { CONFIG, BRICK_COLORS } from './constants.js';

export class Brick {
    constructor(x, y, type = 'single') {
        this.x = x;
        this.y = y;
        this.width = CONFIG.BRICK.WIDTH;
        this.height = CONFIG.BRICK.HEIGHT;
        this.type = type;
        this.active = true;

        // Set properties based on type
        this.initType(type);
    }

    /**
     * Initialize brick properties based on type
     * @param {string} type - Brick type
     */
    initType(type) {
        switch (type) {
            case 'single':
                this.hits = 1;
                this.maxHits = 1;
                this.color = BRICK_COLORS[0];
                this.score = 10;
                this.indestructible = false;
                break;

            case 'double':
                this.hits = 2;
                this.maxHits = 2;
                this.color = BRICK_COLORS[4];
                this.score = 20;
                this.indestructible = false;
                break;

            case 'triple':
                this.hits = 3;
                this.maxHits = 3;
                this.color = BRICK_COLORS[5];
                this.score = 30;
                this.indestructible = false;
                break;

            case 'indestructible':
                this.hits = -1;
                this.maxHits = -1;
                this.color = CONFIG.BRICK_TYPES.INDESTRUCTIBLE.color;
                this.score = 0;
                this.indestructible = true;
                break;

            default:
                this.hits = 1;
                this.maxHits = 1;
                this.color = BRICK_COLORS[0];
                this.score = 10;
                this.indestructible = false;
        }
    }
    
    /**
     * Hit the brick
     * @returns {boolean} - True if brick was destroyed
     */
    hit() {
        if (this.indestructible) return false;
        
        this.hits--;
        
        // Update color based on remaining hits
        this.updateColor();
        
        if (this.hits <= 0) {
            this.active = false;
            return true;
        }
        
        return false;
    }
    
    /**
     * Update brick color based on remaining hits
     */
    updateColor() {
        if (this.indestructible) return;

        // Change color intensity based on damage
        const colorIndex = Math.floor((this.hits / this.maxHits) * (BRICK_COLORS.length - 1));
        this.color = BRICK_COLORS[Math.max(0, colorIndex)];
    }
    
    /**
     * Get brick bounding box
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
     * Check if brick can drop a power-up
     * @returns {boolean}
     */
    canDropPowerUp() {
        return !this.indestructible && this.active;
    }
    
    /**
     * Render the brick
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Main brick body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 3D bevel effect (light top/left, dark bottom/right)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(this.x, this.y, this.width, 3);
        ctx.fillRect(this.x, this.y, 3, this.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);
        ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
        
        // Inner pattern for different brick types
        if (this.type === 'indestructible') {
            // Cross-hatch pattern for indestructible bricks
            ctx.strokeStyle = '#444444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + 4, this.y + 4);
            ctx.lineTo(this.x + this.width - 4, this.y + this.height - 4);
            ctx.moveTo(this.x + this.width - 4, this.y + 4);
            ctx.lineTo(this.x + 4, this.y + this.height - 4);
            ctx.stroke();
        } else if (this.type === 'double' || this.type === 'triple') {
            // Hit indicator dots
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < this.hits; i++) {
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width / 2 + (i - (this.hits - 1) / 2) * 12,
                    this.y + this.height / 2,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}
