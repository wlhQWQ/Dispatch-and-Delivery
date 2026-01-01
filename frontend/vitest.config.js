import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],              // ← Enables JSX/React transformation
  test: {
    globals: true,                 // ← Makes test functions globally available
    environment: 'jsdom',          // ← Simulates a browser environment
    setupFiles: './src/components/test/setup.js',  // ← Runs before each test file
    css: true,                     // ← Handles CSS imports in components
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // ← Enables @ imports
    },
  },
});