import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const targetHost = env.AIRIOT_API_TARGET || ''

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: targetHost ? {
      port: env.AIRIOT_API_PORT || 3000,
      proxy: {
        '/rest': {
          target: targetHost,
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          ws: true,
          target: targetHost,
          changeOrigin: true
        }
      }
    } : undefined
  }
})
