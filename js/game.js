/**
 * Main Game Class
 * Orchestrates all game systems and manages game state
 */

import { CONFIG, GAME_STATES, BALL_STATES, POWERUP_TYPES, POWERUP_STATES } from './constants.js';
import { InputHandler } from './input.js';
import { AudioManager } from './audio.js';
import { Ball } from './ball.js';
import { Paddle } from './paddle.js';
import { LevelManager } from './levels.js';
import { PowerUp } from './powerup.js';
import { Enemy } from './enemy.js';
import { Starfield } from './starfield.js';
import { CollisionDetector } from './collision.js';

export class Game {
    constructor() {
        // Canvas and context
        this.canvas = null;
        this.ctx = null;
        
        // Game systems
        this.input = null;
        this.audio = null;
        this.starfield = null;
        this.levelManager = null;
        
        // Game entities
        this.paddle = null;
        this.balls = [];
        this.powerUps = [];
        this.enemies = [];
        this.lasers = [];
        
        // Game state
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.highScore = 0;
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.level = 0;
        
        // Timing
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = CONFIG.FRAME_TIME;
        
        // Speed increase counter
        this.bricksDestroyed = 0;
        this.speedIncreaseThreshold = 10;
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleSpace = this.handleSpace.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize game systems
     */
    async init() {
        // Get canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        // Initialize systems
        this.input = new InputHandler();
        this.input.bindCanvas(this.canvas);
        this.input.onSpacePressed = this.handleSpace;
        this.input.onMouseClicked = this.handleMouseClick;
        
        this.audio = new AudioManager();
        await this.audio.loadAllSounds();
        
        this.starfield = new Starfield();
        this.levelManager = new LevelManager();
        this.paddle = new Paddle();
        
        // Load high score
        this.loadHighScore();
        
        // Start game loop
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const saved = localStorage.getItem(CONFIG.STORAGE.HIGH_SCORE);
        if (saved) {
            this.highScore = parseInt(saved, 10) || 0;
        }
    }
    
    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(CONFIG.STORAGE.HIGH_SCORE, this.highScore.toString());
        }
    }
    
    /**
     * Start a new game
     */
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = CONFIG.GAME.INITIAL_LIVES;
        this.level = 0;
        this.bricksDestroyed = 0;
        
        // Initialize audio context on user interaction
        this.audio.init();
        
        // Load first level
        this.loadLevel(0);
        
        // Add document class for cursor hiding
        document.body.classList.add('game-active');
    }
    
    /**
     * Load a level
     * @param {number} levelIndex 
     */
    loadLevel(levelIndex) {
        this.level = levelIndex;
        this.levelManager.loadLevel(levelIndex);
        
        // Reset paddle
        this.paddle.reset();
        
        // Create initial ball
        this.balls = [new Ball(
            CONFIG.CANVAS_WIDTH / 2,
            this.paddle.y - 10
        )];
        
        // Setup enemies based on level
        this.setupEnemies();
        
        // Clear power-ups and lasers
        this.powerUps = [];
        this.lasers = [];
    }
    
    /**
     * Setup enemies for current level
     */
    setupEnemies() {
        this.enemies = [];
        
        let numEnemies = CONFIG.ENEMY.MAX_LEVEL_1;
        
        if (this.level >= 3) {
            numEnemies = CONFIG.ENEMY.MAX_LEVEL_4_PLUS;
        } else if (this.level >= 1) {
            numEnemies = CONFIG.ENEMY.MAX_LEVEL_2_3;
        }
        
        // Create enemies at top of screen
        const spacing = CONFIG.CANVAS_WIDTH / (numEnemies + 1);
        for (let i = 0; i < numEnemies; i++) {
            const enemy = new Enemy(
                spacing * (i + 1) - CONFIG.ENEMY.WIDTH / 2,
                150 + i * 50
            );
            // Start with first enemy visible, others hidden
            if (i === 0) {
                enemy.appear();
            }
            this.enemies.push(enemy);
        }
    }
    
    /**
     * Handle space bar press
     */
    handleSpace() {
        if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.GAME_OVER) {
            this.startGame();
            return;
        }
        
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Launch ball if attached
        const mainBall = this.balls[0];
        if (mainBall && mainBall.state === BALL_STATES.ATTACHED) {
            mainBall.launchStraight();
            this.audio.play('PADDLE_HIT', 1.2);
        }
    }
    
    /**
     * Handle mouse click
     */
    handleMouseClick() {
        if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.GAME_OVER) {
            this.startGame();
            return;
        }
        
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Launch ball if attached
        const mainBall = this.balls[0];
        if (mainBall && mainBall.state === BALL_STATES.ATTACHED) {
            mainBall.launchStraight();
            this.audio.play('PADDLE_HIT', 1.2);
        }
    }
    
    /**
     * Main game loop
     * @param {number} timestamp 
     */
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Prevent spiral of death
        if (deltaTime > 100) {
            requestAnimationFrame(this.gameLoop);
            return;
        }
        
        this.accumulator += deltaTime;
        
        // Fixed time step updates
        while (this.accumulator >= this.fixedTimeStep) {
            this.update(this.fixedTimeStep / 1000);
            this.accumulator -= this.fixedTimeStep;
        }
        
        // Render
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time in seconds
     */
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) {
            this.starfield.update(deltaTime);
            return;
        }
        
        // Update starfield
        this.starfield.update(deltaTime);
        
        // Update paddle
        const keyDirection = this.input.getPaddleDirection();
        const mouseX = this.input.getMouseX();

        if (this.input.isMouseActive() && mouseX !== null) {
            // Mouse control
            this.paddle.moveTo(mouseX);
        } else if (keyDirection !== 0) {
            // Keyboard control
            this.paddle.move(keyDirection, deltaTime);
        }
        
        this.paddle.update(deltaTime * 1000);
        
        // Update balls
        this.updateBalls(deltaTime);
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update lasers
        this.updateLasers(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check level completion
        if (this.levelManager.isLevelComplete()) {
            this.completeLevel();
        }
        
        // Reset mouse click
        this.input.resetMouseClick();
    }
    
    /**
     * Update all balls
     * @param {number} deltaTime 
     */
    updateBalls(deltaTime) {
        // Attach balls to paddle if attached
        const mainBall = this.balls[0];
        if (mainBall && mainBall.state === BALL_STATES.ATTACHED) {
            mainBall.x = this.paddle.x + this.paddle.width / 2;
            mainBall.y = this.paddle.y - mainBall.size / 2;
        }
        
        // Update all balls
        for (const ball of this.balls) {
            ball.update(deltaTime);
        }
        
        // Remove inactive balls
        this.balls = this.balls.filter(ball => ball.active);
        
        // Check if all balls lost
        if (this.balls.length === 0) {
            this.loseLife();
        }
    }
    
    /**
     * Update power-ups
     * @param {number} deltaTime 
     */
    updatePowerUps(deltaTime) {
        for (const powerUp of this.powerUps) {
            powerUp.update(deltaTime);
        }
        
        // Remove inactive power-ups
        this.powerUps = this.powerUps.filter(p => p.active);
    }
    
    /**
     * Update enemies
     * @param {number} deltaTime 
     */
    updateEnemies(deltaTime) {
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }
    }
    
    /**
     * Update lasers
     * @param {number} deltaTime 
     */
    updateLasers(deltaTime) {
        const laserSpeed = 600;
        
        for (const laser of this.lasers) {
            laser.y -= laserSpeed * deltaTime;
        }
        
        // Remove off-screen lasers
        this.lasers = this.lasers.filter(l => l.y > -10);
    }
    
    /**
     * Check all collisions
     */
    checkCollisions() {
        const activeBricks = this.levelManager.getActiveBricks();
        
        // Ball collisions
        for (const ball of this.balls) {
            if (ball.state !== BALL_STATES.LAUNCHED) continue;
            
            // Ball-brick collisions
            for (const brick of activeBricks) {
                const collision = CollisionDetector.checkBallBrick(ball, brick);
                if (collision) {
                    CollisionDetector.resolveBallBrick(ball, brick, collision);
                    
                    if (brick.hit()) {
                        // Brick destroyed
                        this.score += brick.score;
                        this.bricksDestroyed++;
                        this.audio.play('BRICK_HIT', 0.8 + Math.random() * 0.4);
                        
                        // Drop power-up chance
                        if (brick.canDropPowerUp() && Math.random() < CONFIG.POWERUP.DROP_CHANCE) {
                            this.spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height);
                        }
                        
                        // Increase speed periodically
                        if (this.bricksDestroyed % this.speedIncreaseThreshold === 0) {
                            ball.increaseSpeed(1.05);
                        }
                    } else {
                        this.audio.play('BRICK_HIT', 0.6);
                    }
                    break; // Only collide with one brick per frame
                }
            }
            
            // Ball-paddle collision
            const paddleCollision = CollisionDetector.checkBallPaddle(ball, this.paddle);
            if (paddleCollision) {
                CollisionDetector.resolveBallPaddle(ball, this.paddle, paddleCollision);
                this.audio.play('PADDLE_HIT', 0.8 + Math.random() * 0.3);
            }
            
            // Ball-enemy collision
            for (const enemy of this.enemies) {
                if (CollisionDetector.checkBallEnemy(ball, enemy)) {
                    enemy.deflectBall(ball);
                    this.audio.play('WALL_HIT', 1.5);
                }
            }
        }
        
        // Power-up collisions
        for (const powerUp of this.powerUps) {
            if (powerUp.state === POWERUP_STATES.FALLING &&
                CollisionDetector.checkPowerUpPaddle(powerUp, this.paddle)) {
                this.activatePowerUp(powerUp);
            }
        }
        
        // Laser-enemy collisions
        for (const laser of this.lasers) {
            for (const enemy of this.enemies) {
                if (enemy.active && enemy.visible &&
                    CollisionDetector.checkLaserEnemy(laser.x, laser.y, enemy)) {
                    enemy.hit();
                    laser.y = -100; // Remove laser
                    this.score += 50;
                    this.audio.play('ENEMY_HIT');
                }
            }
        }
    }
    
    /**
     * Spawn a power-up
     * @param {number} x 
     * @param {number} y 
     */
    spawnPowerUp(x, y) {
        const types = Object.values(POWERUP_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.powerUps.push(new PowerUp(x, y, randomType));
    }
    
    /**
     * Activate power-up effect
     * @param {PowerUp} powerUp 
     */
    activatePowerUp(powerUp) {
        powerUp.active = false;
        powerUp.state = POWERUP_STATES.CAUGHT;
        this.audio.play('POWERUP');
        
        switch (powerUp.type) {
            case POWERUP_TYPES.EXTEND:
                this.paddle.extend(CONFIG.POWERUP.DURATION);
                break;
                
            case POWERUP_TYPES.SLOW:
                for (const ball of this.balls) {
                    ball.speed = Math.max(CONFIG.BALL.BASE_SPEED, ball.speed * 0.7);
                }
                break;
                
            case POWERUP_TYPES.MULTIBALL:
                this.spawnExtraBalls();
                break;
                
            case POWERUP_TYPES.LASER:
                this.paddle.enableLaser(CONFIG.POWERUP.DURATION);
                break;
        }
    }
    
    /**
     * Spawn extra balls for multiball power-up
     */
    spawnExtraBalls() {
        const mainBall = this.balls[0];
        if (!mainBall) return;
        
        // Create two additional balls
        const leftBall = new Ball(mainBall.x, mainBall.y);
        const rightBall = new Ball(mainBall.x, mainBall.y);
        
        leftBall.state = BALL_STATES.LAUNCHED;
        rightBall.state = BALL_STATES.LAUNCHED;
        
        // Different angles
        leftBall.setVelocityAngle(-Math.PI / 6);
        rightBall.setVelocityAngle(Math.PI / 6);
        
        this.balls.push(leftBall, rightBall);
    }
    
    /**
     * Fire laser from paddle
     */
    fireLaser() {
        if (!this.paddle.hasLaser) return;
        
        const positions = this.paddle.getLaserPositions();
        for (const pos of positions) {
            this.lasers.push({ x: pos.x, y: pos.y });
        }
        
        this.audio.play('LASER');
    }
    
    /**
     * Lose a life
     */
    loseLife() {
        this.lives--;
        this.audio.play('LIFE_LOST');
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // Reset ball on paddle
            this.balls = [new Ball(
                CONFIG.CANVAS_WIDTH / 2,
                this.paddle.y - 10
            )];
            this.lasers = [];
        }
    }
    
    /**
     * Complete current level
     */
    completeLevel() {
        this.audio.play('POWERUP', 1.5); // Victory sound
        this.level++;
        this.loadLevel(this.level);
    }
    
    /**
     * Game over
     */
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.saveHighScore();
        document.body.classList.remove('game-active');
    }
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Render starfield background
        this.starfield.render(this.ctx);
        
        if (this.state === GAME_STATES.MENU) {
            this.renderMenu();
        } else if (this.state === GAME_STATES.PLAYING) {
            this.renderGame();
        } else if (this.state === GAME_STATES.GAME_OVER) {
            this.renderGame();
            this.renderGameOver();
        }
    }
    
    /**
     * Render menu screen
     */
    renderMenu() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Title
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 80px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ARKANOID', CONFIG.CANVAS_WIDTH / 2, 300);
        
        // Subtitle
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.font = '30px "Courier New", monospace';
        this.ctx.fillText('RETRO BRICK BREAKER', CONFIG.CANVAS_WIDTH / 2, 360);
        
        // Instructions
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px "Courier New", monospace';
        this.ctx.fillText('Press SPACE or CLICK to Start', CONFIG.CANVAS_WIDTH / 2, 500);
        
        // Controls
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.font = '18px "Courier New", monospace';
        this.ctx.fillText('Controls:', CONFIG.CANVAS_WIDTH / 2, 600);
        this.ctx.fillText('Arrow Keys / A,D - Move Paddle', CONFIG.CANVAS_WIDTH / 2, 640);
        this.ctx.fillText('Mouse - Move Paddle', CONFIG.CANVAS_WIDTH / 2, 670);
        this.ctx.fillText('Space / Click - Launch Ball', CONFIG.CANVAS_WIDTH / 2, 700);
        
        // High score
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.font = '28px "Courier New", monospace';
        this.ctx.fillText(`High Score: ${this.highScore}`, CONFIG.CANVAS_WIDTH / 2, 800);
        
        this.ctx.restore();
    }
    
    /**
     * Render game elements
     */
    renderGame() {
        // Render bricks
        for (const brick of this.levelManager.getActiveBricks()) {
            brick.render(this.ctx);
        }
        
        // Render paddle
        this.paddle.render(this.ctx);
        
        // Render balls
        for (const ball of this.balls) {
            ball.render(this.ctx);
        }
        
        // Render power-ups
        for (const powerUp of this.powerUps) {
            powerUp.render(this.ctx);
        }
        
        // Render enemies
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
        
        // Render lasers
        this.ctx.fillStyle = '#FF4500';
        for (const laser of this.lasers) {
            this.ctx.fillRect(laser.x - 2, laser.y, 4, 15);
        }
        
        // Render UI
        this.renderUI();
    }
    
    /**
     * Render user interface
     */
    renderUI() {
        this.ctx.save();
        
        // Score
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px "Courier New", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 35);
        
        // High Score
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`HIGH: ${this.highScore}`, CONFIG.CANVAS_WIDTH / 2, 35);
        
        // Lives
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`LIVES: ${this.lives}`, CONFIG.CANVAS_WIDTH - 20, 35);
        
        // Level
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`LEVEL: ${this.levelManager.getCurrentLevelNumber()}`, 20, 65);
        
        // Remaining bricks
        const remaining = this.levelManager.getRemainingBricks();
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.fillText(`BRICKS: ${remaining}`, 20, 90);
        
        this.ctx.restore();
    }
    
    /**
     * Render game over screen
     */
    renderGameOver() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Game Over text
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 80px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, 400);
        
        // Final score
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '36px "Courier New", monospace';
        this.ctx.fillText(`Final Score: ${this.score}`, CONFIG.CANVAS_WIDTH / 2, 480);
        
        // Restart instruction
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.font = '28px "Courier New", monospace';
        this.ctx.fillText('Press SPACE or CLICK to Restart', CONFIG.CANVAS_WIDTH / 2, 560);
        
        this.ctx.restore();
    }
}
