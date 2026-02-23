/**
 * Arkanoid Game Constants and Configuration
 * Central configuration for all game parameters
 */

export const CONFIG = {
    // Canvas dimensions (physical pixels)
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    
    // Game resolution (logical pixels, 4x scale factor)
    GAME_WIDTH: 960,
    GAME_HEIGHT: 540,
    
    // Scale factor for retro pixel art
    PIXEL_SCALE: 4,
    
    // Target frame rate for delta-time normalization
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60, // ~16.67ms per frame
    
    // Paddle settings
    PADDLE: {
        WIDTH: 120,
        HEIGHT: 20,
        Y_POSITION: 60,       // Distance from bottom (paddle at bottom)
        SPEED: 400,           // Pixels per second
        COLOR: '#C0C0C0',     // Silver
        BORDER_COLOR: '#808080'
    },
    
    // Ball settings
    BALL: {
        SIZE: 8,
        BASE_SPEED: 400,      // Pixels per second
        MAX_SPEED: 800,
        COLOR: '#FFFF00',     // Yellow
        GLOW_COLOR: '#FFFFFF'
    },
    
    // Brick settings
    BRICK: {
        WIDTH: 188,           // Calculated for 8 columns at 80% width
        HEIGHT: 48,
        PADDING: 4,
        OFFSET_X: 192,        // Centered: (1920 - 1536) / 2
        OFFSET_Y: 60,         // Top of screen
        ROWS: 6,
        COLS: 8
    },
    
    // Brick types
    BRICK_TYPES: {
        SINGLE: { hits: 1, color: '#FF6B6B', score: 10 },
        DOUBLE: { hits: 2, color: '#4ECDC4', score: 20 },
        TRIPLE: { hits: 3, color: '#95E1D3', score: 30 },
        INDESTRUCTIBLE: { hits: -1, color: '#666666', score: 0 }
    },
    
    // Power-up settings
    POWERUP: {
        WIDTH: 24,
        HEIGHT: 12,
        SPEED: 150,           // Falling speed
        DROP_CHANCE: 0.2,     // 20% chance
        DURATION: 10000,      // 10 seconds effect
        COLORS: {
            EXTEND: '#00FF00',  // E - Extend paddle
            SLOW: '#00FFFF',    // S - Slow ball
            MULTIBALL: '#FF00FF', // M - Extra ball
            LASER: '#FF4500'    // L - Laser power-up
        }
    },
    
    // Enemy settings
    ENEMY: {
        WIDTH: 40,
        HEIGHT: 40,
        SPEED: 80,
        COLOR: '#FF0000',
        APPEAR_DELAY: 30000,  // 30 seconds before reappearance
        MAX_LEVEL_1: 1,
        MAX_LEVEL_2_3: 2,
        MAX_LEVEL_4_PLUS: 3
    },
    
    // Game settings
    GAME: {
        INITIAL_LIVES: 3,
        BOUNCE_ANGLES: [30, 45, 60], // Degrees
        MIN_BOUNCE_ANGLE: Math.PI / 6,   // 30°
        MAX_BOUNCE_ANGLE: Math.PI / 3    // 60°
    },
    
    // Audio settings
    AUDIO: {
        VOLUME: 0.3,
        FILES: {
            BRICK_HIT: 'audio/brick_hit.wav',
            PADDLE_HIT: 'audio/paddle_hit.wav',
            WALL_HIT: 'audio/wall_hit.wav',
            POWERUP: 'audio/powerup.wav',
            LIFE_LOST: 'audio/life_lost.wav',
            LASER: 'audio/laser.wav',
            ENEMY_HIT: 'audio/enemy_hit.wav'
        }
    },
    
    // Storage keys
    STORAGE: {
        HIGH_SCORE: 'arkanoid_highscore'
    }
};

// Brick colors palette (80s arcade style)
export const BRICK_COLORS = [
    '#8B00FF', // Purple
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#0000FF'  // Blue
];

// Power-up types
export const POWERUP_TYPES = {
    EXTEND: 'E',      // Extend paddle
    SLOW: 'S',        // Slow ball
    MULTIBALL: 'M',   // Extra ball
    LASER: 'L'        // Laser power-up
};

// Game states
export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameover',
    LEVEL_COMPLETE: 'levelcomplete'
};

// Ball states
export const BALL_STATES = {
    ATTACHED: 'attached',   // Ball on paddle
    LAUNCHED: 'launched',   // Ball in play
    CAUGHT: 'caught'        // Ball caught (laser mode)
};

// Power-up states
export const POWERUP_STATES = {
    SPAWNED: 'spawned',
    FALLING: 'falling',
    CAUGHT: 'caught',
    EXPIRED: 'expired'
};
