import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // dev 프록시: /api → backend
      '/api': {
        target: process.env.VITE_API_BASE ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
