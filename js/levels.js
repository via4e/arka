/**
 * Level Patterns
 * Predefined brick formations for each level
 * 
 * Pattern format:
 * - Each row is a string
 * - Characters represent brick types:
 *   ' ' = empty space
 *   '1' = single-hit brick
 *   '2' = double-hit brick
 *   '3' = triple-hit brick
 *   'I' = indestructible brick
 * 
 * Grid: 8 columns x 6 rows, centered at top of screen
 */

export const LEVEL_PATTERNS = [
    // Level 1 - Classic pyramid (fulfill with bricks)
    {
        pattern: [
            '11111111',
            '11111111',
            '11111111',
            '11111111',
            '11111111',
            '11233211'
        ],
        colors: ['purple', 'orange', 'yellow', 'green']
    },
    
    // Level 2 - Checkerboard
    {
        pattern: [
            '1 1 1 1',
            ' 1 1 1 ',
            '1 2 2 1',
            ' 2 2 2 ',
            '1 2 3 1',
            ' 2 3 2 '
        ],
        colors: ['blue', 'purple', 'red', 'orange']
    },
    
    // Level 3 - Fortress
    {
        pattern: [
            'II    II',
            'I33  33I',
            'I32  23I',
            'I32  23I',
            '11111111',
            '22222222'
        ],
        colors: ['green', 'yellow', 'orange', 'red']
    },
    
    // Level 4 - Arches
    {
        pattern: [
            '111  111',
            '1    1  ',
            '1 I  I 1',
            '111  111',
            '222  222',
            '33333333'
        ],
        colors: ['purple', 'blue', 'green', 'yellow']
    },
    
    // Level 5 - Spiral
    {
        pattern: [
            '11111111',
            '1I    I1',
            '1I 33 I1',
            '1I 33 I1',
            '1I    I1',
            '11111111'
        ],
        colors: ['red', 'orange', 'yellow', 'green']
    },
    
    // Level 6 - Cross
    {
        pattern: [
            '  11  ',
            '  11  ',
            '111111',
            '112211',
            '112211',
            '  11  '
        ],
        colors: ['blue', 'purple', 'red', 'orange']
    },
    
    // Level 7 - Castle
    {
        pattern: [
            'I  I  I  I',
            'I33I  I33I',
            '11111111',
            '12222221',
            '12333321',
            '12333321'
        ],
        colors: ['green', 'yellow', 'orange', 'red']
    },
    
    // Level 8 - Diamond
    {
        pattern: [
            '  11  ',
            ' 1221 ',
            '123321',
            '123321',
            ' 1221 ',
            '  11  '
        ],
        colors: ['purple', 'blue', 'green', 'yellow']
    },
    
    // Level 9 - Waves
    {
        pattern: [
            '1 1 1 1',
            ' 1 1 1 ',
            '2 2 2 2',
            ' 2 2 2 ',
            '3 3 3 3',
            ' 3 3 3 '
        ],
        colors: ['red', 'orange', 'yellow', 'green']
    },
    
    // Level 10 - Final Challenge
    {
        pattern: [
            'IIIIIIII',
            'I333333I',
            'I322223I',
            'I321123I',
            'I32  23I',
            'IIII  IIII'
        ],
        colors: ['blue', 'purple', 'red', 'orange']
    }
];

/**
 * Level Manager
 * Handles level loading, progression, and brick spawning
 */

import { CONFIG, BRICK_COLORS } from './constants.js';
import { Brick } from './brick.js';

export class LevelManager {
    constructor() {
        this.currentLevel = 0;
        this.bricks = [];
        this.totalLevels = LEVEL_PATTERNS.length;
    }
    
    /**
     * Load a level by index
     * @param {number} levelIndex - Level index (0-based)
     * @returns {Array} - Array of Brick objects
     */
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.bricks = [];
        
        // Loop back to first level if we've completed all levels
        const patternIndex = levelIndex % this.totalLevels;
        const levelData = LEVEL_PATTERNS[patternIndex];
        
        if (!levelData) {
            console.error(`Level ${patternIndex} not found`);
            return this.bricks;
        }
        
        // Calculate brick positions
        const brickWidth = CONFIG.BRICK.WIDTH;
        const brickHeight = CONFIG.BRICK.HEIGHT;
        const padding = CONFIG.BRICK.PADDING;
        const offsetX = CONFIG.BRICK.OFFSET_X;
        const offsetY = CONFIG.BRICK.OFFSET_Y;
        
        // Parse pattern and create bricks
        levelData.pattern.forEach((row, rowIndex) => {
            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const char = row[colIndex];
                
                if (char === ' ') continue;
                
                const x = offsetX + colIndex * (brickWidth + padding);
                const y = offsetY + rowIndex * (brickHeight + padding);
                
                // Map character to brick type
                let type = 'single';
                switch (char) {
                    case '1':
                        type = 'single';
                        break;
                    case '2':
                        type = 'double';
                        break;
                    case '3':
                        type = 'triple';
                        break;
                    case 'I':
                        type = 'indestructible';
                        break;
                }
                
                this.bricks.push(new Brick(x, y, type));
            }
        });
        
        return this.bricks;
    }
    
    /**
     * Get the next level index
     * @returns {number}
     */
    getNextLevel() {
        return this.currentLevel + 1;
    }
    
    /**
     * Check if all destructible bricks are destroyed
     * @returns {boolean}
     */
    isLevelComplete() {
        return this.bricks.every(brick => !brick.active || brick.indestructible);
    }
    
    /**
     * Get remaining destructible bricks count
     * @returns {number}
     */
    getRemainingBricks() {
        return this.bricks.filter(brick => brick.active && !brick.indestructible).length;
    }
    
    /**
     * Get all active bricks
     * @returns {Array}
     */
    getActiveBricks() {
        return this.bricks.filter(brick => brick.active);
    }
    
    /**
     * Get current level number (1-based)
     * @returns {number}
     */
    getCurrentLevelNumber() {
        return this.currentLevel + 1;
    }
    
    /**
     * Reset level manager
     */
    reset() {
        this.currentLevel = 0;
        this.bricks = [];
    }
}
