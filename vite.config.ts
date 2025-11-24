import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/LogSense/', // Ensures correct paths for GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});