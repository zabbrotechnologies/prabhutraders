import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  envDir: '../',
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
  },
});
