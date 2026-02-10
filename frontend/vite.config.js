import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 9000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9500',
        changeOrigin: true
      }
    }
  }
})