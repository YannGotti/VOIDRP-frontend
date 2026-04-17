import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import sitemap from 'vite-plugin-sitemap'

const API_PROXY_TARGET = 'https://api.void-rp.ru'

export default defineConfig({
  plugins: [vue(), tailwindcss(),
	sitemap({
      		hostname: 'https://void-rp.ru',
    	})],
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    allowedHosts: [ "minecraftrating.ru", "127.0.0.1", "0.0.0.0"],
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
