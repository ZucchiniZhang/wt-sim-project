import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers for smaller output
    target: 'es2020',
    // Vendor chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-utils': ['fuse.js', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Increase chunk size warning limit (recharts is large)
    chunkSizeWarningLimit: 300,
  },
})
