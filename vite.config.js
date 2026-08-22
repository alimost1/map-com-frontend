import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'map-com.executioneveryday.com',
      'api.map-com.executioneveryday.com',
      'localhost',
      '.executioneveryday.com'
    ],
    proxy: {
      '/api/v2': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    // SPA fallback for client-side routing in dev
    middlewareMode: false,
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
  appType: 'spa',
})