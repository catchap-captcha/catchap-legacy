import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Builds src/widget-entry.tsx into a single dependency-free <script> file
// (dist-widget/catchap-guard.js) that any external site can drop in — no
// separate CSS link, no React/ReactDOM of its own required.
// Usage: npm run build:widget
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-widget',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/widget-entry.tsx',
      name: 'CatChapGuard',
      formats: ['iife'],
      fileName: () => 'catchap-guard.js',
    },
  },
})
