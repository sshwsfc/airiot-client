import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
      babel: {
        presets: ['jotai/babel/preset'],
      },
    }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/rest': {
        target: 'http://v4.airiot.tech:3030/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
