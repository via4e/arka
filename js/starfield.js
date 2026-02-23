/**
 * Star Background
 * Animated starfield that scrolls into the distance
 */

import { CONFIG } from './constants.js';

export class Starfield {
    constructor() {
        this.stars = [];
        this.numStars = 150;
        this.speed = 50; // Pixels per second
        
        this.init();
    }
    
    /**
     * Initialize starfield
     */
    init() {
        this.stars = [];
        
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push(this.createRandomStar());
        }
    }
    
    /**
     * Create a random star
     * @returns {object} - Star properties
     */
    createRandomStar() {
        return {
            x: Math.random() * CONFIG.CANVAS_WIDTH,
            y: Math.random() * CONFIG.CANVAS_HEIGHT,
            z: Math.random() * 2 + 0.5, // Depth factor (0.5 to 2.5)
            size: Math.random() * 2 + 1, // 1-3 pixels
            brightness: Math.random() * 0.5 + 0.5, // 0.5-1.0
            twinkleSpeed: Math.random() * 2 + 1,
            twinkleOffset: Math.random() * Math.PI * 2
        };
    }
    
    /**
     * Update star positions
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        const time = Date.now() / 1000;
        
        for (const star of this.stars) {
            // Move star downward (simulating forward movement)
            star.y += this.speed * star.z * deltaTime;
            
            // Reset star when it goes off screen
            if (star.y > CONFIG.CANVAS_HEIGHT) {
                star.y = -10;
                star.x = Math.random() * CONFIG.CANVAS_WIDTH;
                star.z = Math.random() * 2 + 0.5;
            }
            
            // Twinkle effect
            star.currentBrightness = star.brightness * (0.7 + 0.3 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
        }
    }
    
    /**
     * Render the starfield
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        // Draw dark space background with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.5, '#000022');
        gradient.addColorStop(1, '#000033');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Draw stars
        for (const star of this.stars) {
            // Calculate star color based on brightness and depth
            const brightness = Math.floor(star.currentBrightness * 255);
            const sizeMultiplier = star.z; // Farther stars are smaller
            
            // Color varies slightly based on depth
            let r, g, b;
            if (star.z > 1.5) {
                // Distant stars - bluish
                r = Math.floor(brightness * 0.7);
                g = Math.floor(brightness * 0.8);
                b = brightness;
            } else if (star.z < 1.0) {
                // Close stars - yellowish
                r = brightness;
                g = Math.floor(brightness * 0.9);
                b = Math.floor(brightness * 0.7);
            } else {
                // Medium distance - white
                r = brightness;
                g = brightness;
                b = brightness;
            }
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Draw star as a small square (pixel art style)
            const size = Math.max(1, star.size * sizeMultiplier);
            ctx.fillRect(
                star.x - size / 2,
                star.y - size / 2,
                size,
                size
            );
        }
    }
}
