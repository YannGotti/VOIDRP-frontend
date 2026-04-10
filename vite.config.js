import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const API_PROXY_TARGET = 'https://api.void-rp.ru'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      '/media': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
