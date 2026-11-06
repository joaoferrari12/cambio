/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://joaoferrari12.github.io/cambio/
  base: process.env.VITE_BASE ?? '/cambio/',
  build: {
    // Split the chart library from the app so the first paint does not wait for it.
    rolldownOptions: { output: { codeSplitting: { groups: [{ name: 'recharts', test: /node_modules[\\/](recharts|d3-|victory-vendor|internmap|decimal\.js)/ }] } } },
  },
  test: {
    // A machine with NODE_ENV=production set globally would load the production build of React, which has no act(); pin it.
    env: { NODE_ENV: 'test' },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
