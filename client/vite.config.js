import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Where the local API lives. The browser tests run their own API on another
// port and point this at it (see e2e/playwright.config.js).
const api = process.env.API_PROXY_TARGET || 'http://localhost:3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': api,
      '/uploads': api,
    },
  },
})
