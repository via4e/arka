/**
 * Input Handler
 * Manages keyboard and mouse input for game controls
 */

import { CONFIG } from './constants.js';

export class InputHandler {
    constructor() {
        // Key states
        this.keys = {
            left: false,
            right: false,
            space: false
        };

        // Mouse state
        this.mouseX = null;
        this.mouseActive = false;  // Track if mouse is being used
        this.mouseClicked = false;

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);

        // Canvas reference for mouse position calculation
        this.canvas = null;

        // Initialize event listeners
        this.init();
    }
    
    /**
     * Initialize event listeners
     */
    init() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Mouse events will be bound when canvas is available
    }
    
    /**
     * Bind mouse events to canvas
     * @param {HTMLCanvasElement} canvas 
     */
    bindCanvas(canvas) {
        this.canvas = canvas;
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mousedown', this.handleMouseDown);
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                this.mouseActive = false;  // Switch to keyboard control
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                this.mouseActive = false;  // Switch to keyboard control
                break;
            case 'Space':
                if (!this.keys.space) {
                    this.keys.space = true;
                    this.onSpacePressed();
                }
                break;
        }
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event 
     */
    handleKeyUp(event) {
        switch (event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.space = false;
                break;
        }
    }
    
    /**
     * Handle mouse move events
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;

        // Calculate mouse position in canvas coordinates
        this.mouseX = (event.clientX - rect.left) * scaleX;

        // Clamp to canvas bounds
        this.mouseX = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH, this.mouseX));
        
        // Mark mouse as active
        this.mouseActive = true;
    }
    
    /**
     * Handle mouse down events
     * @param {MouseEvent} event 
     */
    handleMouseDown(event) {
        if (event.button === 0) { // Left click
            this.mouseClicked = true;
            this.onMouseClicked();
        }
    }
    
    /**
     * Callback for space bar press
     * Override this to handle space input
     */
    onSpacePressed() {
        // To be overridden by game
    }
    
    /**
     * Callback for mouse click
     * Override this to handle mouse input
     */
    onMouseClicked() {
        // To be overridden by game
    }
    
    /**
     * Reset mouse click state
     */
    resetMouseClick() {
        this.mouseClicked = false;
    }
    
    /**
     * Get paddle movement direction
     * @returns {number} -1 for left, 1 for right, 0 for none
     */
    getPaddleDirection() {
        if (this.keys.left) return -1;
        if (this.keys.right) return 1;
        return 0;
    }
    
    /**
     * Check if space was pressed
     * @returns {boolean}
     */
    isSpacePressed() {
        return this.keys.space;
    }
    
    /**
     * Check if mouse was clicked
     * @returns {boolean}
     */
    isMouseClicked() {
        return this.mouseClicked;
    }
    
    /**
     * Get mouse X position in canvas coordinates
     * @returns {number|null}
     */
    getMouseX() {
        return this.mouseX;
    }

    /**
     * Check if mouse control is active
     * @returns {boolean}
     */
    isMouseActive() {
        return this.mouseActive;
    }
    
    /**
     * Destroy event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        }
    }
}
