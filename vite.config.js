/**
 * Vite Configuration for Arkanoid
 * Builds a standalone game that works without a server
 */

import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Plugin to copy audio files after build
const copyAudioPlugin = () => ({
  name: 'copy-audio',
  closeBundle() {
    const audioSrc = path.join('audio');
    const audioDest = path.join('dist', 'audio');
    
    if (existsSync(audioSrc)) {
      if (!existsSync(audioDest)) {
        mkdirSync(audioDest, { recursive: true });
      }
      
      const files = ['brick_hit.wav', 'paddle_hit.wav', 'wall_hit.wav', 
                     'powerup.wav', 'life_lost.wav', 'laser.wav', 'enemy_hit.wav'];
      
      for (const file of files) {
        const src = path.join(audioSrc, file);
        const dest = path.join(audioDest, file);
        if (existsSync(src)) {
          copyFileSync(src, dest);
        }
      }
    }
  }
});

export default defineConfig({
  base: './',
  plugins: [copyAudioPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
