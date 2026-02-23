/**
 * Collision Detection System
 * Handles all collision detection between game entities
 */

import { CONFIG, BALL_STATES } from './constants.js';

export class CollisionDetector {
    /**
     * Check AABB collision between two rectangles
     * @param {object} rect1 - First rectangle {x, y, width, height}
     * @param {object} rect2 - Second rectangle {x, y, width, height}
     * @returns {boolean}
     */
    static checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    /**
     * Check circle-rectangle collision
     * @param {object} circle - Circle {x, y, radius}
     * @param {object} rect - Rectangle {x, y, width, height}
     * @returns {object|null} - Collision info or null
     */
    static checkCircleRect(circle, rect) {
        // Find closest point on rectangle to circle center
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate distance from circle center to closest point
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.radius) {
            // Collision detected
            // Determine collision side
            let side = 'top';
            
            // Check overlap on each axis
            const overlapX = circle.radius - Math.abs(dx);
            const overlapY = circle.radius - Math.abs(dy);
            
            // Determine which side was hit based on position
            if (circle.y < rect.y) {
                side = 'top';
            } else if (circle.y > rect.y + rect.height) {
                side = 'bottom';
            } else if (circle.x < rect.x) {
                side = 'left';
            } else if (circle.x > rect.x + rect.width) {
                side = 'right';
            } else {
                // Circle center is inside rectangle
                // Use the smaller overlap to determine side
                if (overlapX < overlapY) {
                    side = circle.x < rect.x + rect.width / 2 ? 'left' : 'right';
                } else {
                    side = circle.y < rect.y + rect.height / 2 ? 'top' : 'bottom';
                }
            }
            
            return {
                collided: true,
                side: side,
                dx: dx,
                dy: dy,
                distance: distance
            };
        }
        
        return null;
    }
    
    /**
     * Check ball-brick collision
     * @param {Ball} ball - Ball object
     * @param {Brick} brick - Brick object
     * @returns {object|null} - Collision info or null
     */
    static checkBallBrick(ball, brick) {
        if (!brick.active) return null;
        
        const circle = {
            x: ball.x,
            y: ball.y,
            radius: ball.size / 2
        };
        
        return this.checkCircleRect(circle, brick.getBounds());
    }
    
    /**
     * Check ball-paddle collision and calculate bounce angle
     * @param {Ball} ball - Ball object
     * @param {Paddle} paddle - Paddle object
     * @returns {object|null} - Collision info with bounce angle or null
     */
    static checkBallPaddle(ball, paddle) {
        const ballBounds = ball.getBounds();
        const paddleBounds = paddle.getBounds();
        
        if (!this.checkAABB(ballBounds, paddleBounds)) {
            return null;
        }
        
        // Only collide if ball is moving downward
        if (ball.dy <= 0) return null;
        
        // Calculate hit position relative to paddle center (-1 to 1)
        const hitPos = paddle.getHitPosition(ball.x);
        
        // Calculate bounce angle based on hit position
        // Center hit = straight up, edge hits = angled
        const maxAngle = CONFIG.GAME.MAX_BOUNCE_ANGLE;
        const bounceAngle = hitPos * maxAngle;
        
        return {
            collided: true,
            angle: bounceAngle,
            hitPosition: hitPos
        };
    }
    
    /**
     * Check ball-enemy collision
     * @param {Ball} ball - Ball object
     * @param {Enemy} enemy - Enemy object
     * @returns {boolean}
     */
    static checkBallEnemy(ball, enemy) {
        return enemy.checkBallCollision(ball);
    }
    
    /**
     * Check power-up-paddle collision
     * @param {PowerUp} powerUp - PowerUp object
     * @param {Paddle} paddle - Paddle object
     * @returns {boolean}
     */
    static checkPowerUpPaddle(powerUp, paddle) {
        return powerUp.checkPaddleCollision(paddle.getBounds());
    }
    
    /**
     * Check laser-enemy collision
     * @param {number} laserX - Laser X position
     * @param {number} laserY - Laser Y position
     * @param {Enemy} enemy - Enemy object
     * @returns {boolean}
     */
    static checkLaserEnemy(laserX, laserY, enemy) {
        return enemy.checkLaserCollision(laserX, laserY);
    }
    
    /**
     * Resolve ball-brick collision
     * @param {Ball} ball - Ball object
     * @param {Brick} brick - Brick object
     * @param {object} collision - Collision info
     */
    static resolveBallBrick(ball, brick, collision) {
        if (!collision) return;
        
        // Reflect ball based on collision side
        switch (collision.side) {
            case 'top':
            case 'bottom':
                ball.dy = -ball.dy;
                ball.y = collision.side === 'top' ? brick.y - ball.size / 2 : brick.y + brick.height + ball.size / 2;
                break;
            case 'left':
            case 'right':
                ball.dx = -ball.dx;
                ball.x = collision.side === 'left' ? brick.x - ball.size / 2 : brick.x + brick.width + ball.size / 2;
                break;
        }
    }
    
    /**
     * Resolve ball-paddle collision
     * @param {Ball} ball - Ball object
     * @param {Paddle} paddle - Paddle object
     * @param {object} collision - Collision info
     */
    static resolveBallPaddle(ball, paddle, collision) {
        if (!collision) return;
        
        // Set new velocity based on bounce angle
        ball.setVelocityAngle(collision.angle);
        
        // Ensure ball is above paddle
        ball.y = paddle.y - ball.size / 2;
        
        // Add a slight speed increase on paddle hit
        ball.speed = Math.min(ball.speed * 1.02, CONFIG.BALL.MAX_SPEED);
    }
}
