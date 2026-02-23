/**
 * Audio Manager
 * Handles all game sound effects using Web Audio API
 */

import { CONFIG } from './constants.js';

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.enabled = true;
        this.volume = CONFIG.AUDIO.VOLUME;
        
        // Track loaded sounds
        this.loaded = new Set();
    }
    
    /**
     * Initialize audio context (must be called after user interaction)
     */
    init() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported', e);
                this.enabled = false;
            }
        }
    }
    
    /**
     * Load a sound effect
     * @param {string} name - Sound identifier
     * @param {string} path - Path to audio file
     */
    async loadSound(name, path) {
        if (!this.enabled) return;
        
        try {
            const response = await fetch(path);
            if (!response.ok) {
                console.warn(`Audio file not found: ${path}`);
                return;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
            this.loaded.add(name);
        } catch (e) {
            console.warn(`Failed to load sound ${name}:`, e);
        }
    }
    
    /**
     * Load all game sounds
     */
    async loadAllSounds() {
        if (!this.enabled) return;
        
        const promises = Object.entries(CONFIG.AUDIO.FILES).map(([name, path]) => 
            this.loadSound(name, path)
        );
        
        await Promise.all(promises);
    }
    
    /**
     * Play a sound effect
     * @param {string} name - Sound identifier
     * @param {number} pitch - Pitch multiplier (default: 1)
     * @param {number} volume - Volume override (default: config volume)
     */
    play(name, pitch = 1, volume = null) {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const buffer = this.sounds.get(name);
        if (!buffer) {
            // Fallback to synthesized sounds if file not loaded
            this.playSynthesized(name, pitch, volume);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitch;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume !== null ? volume : this.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
    }
    
    /**
     * Play synthesized sound as fallback
     * @param {string} name - Sound type
     * @param {number} pitch - Pitch
     * @param {number} volume - Volume
     */
    playSynthesized(name, pitch = 1, volume = null) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const vol = volume !== null ? volume : this.volume * 0.5;
        gainNode.gain.value = vol;
        
        const now = this.audioContext.currentTime;
        
        switch (name) {
            case 'BRICK_HIT':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(400 * pitch, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'PADDLE_HIT':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300 * pitch, now);
                oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;
                
            case 'WALL_HIT':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500 * pitch, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;
                
            case 'POWERUP':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.linearRampToValueAtTime(1200, now + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
                
            case 'LIFE_LOST':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                oscillator.start(now);
                oscillator.stop(now + 0.5);
                break;
                
            case 'LASER':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                oscillator.start(now);
                oscillator.stop(now + 0.15);
                break;
                
            case 'ENEMY_HIT':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    }
    
    /**
     * Set master volume
     * @param {number} value - Volume (0-1)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }
    
    /**
     * Enable/disable audio
     * @param {boolean} enabled 
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Check if a sound is loaded
     * @param {string} name 
     * @returns {boolean}
     */
    isLoaded(name) {
        return this.loaded.has(name);
    }
}
