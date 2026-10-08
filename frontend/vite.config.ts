// Configuração técnica única do frontend ETP Systems.
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    proxy: {
      '/api': process.env.API_PROXY_TARGET ?? loadEnv(mode, process.cwd(), 'API_').API_PROXY_TARGET ?? 'http://localhost:8080',
    },
  },
}))
