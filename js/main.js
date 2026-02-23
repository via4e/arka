/**
 * Arkanoid - Main Entry Point
 * Initializes and starts the game
 */

import { Game } from './game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the game
    const game = new Game();
    
    // Expose game instance for debugging (optional)
    if (typeof window !== 'undefined') {
        window.arkanoidGame = game;
    }
});
