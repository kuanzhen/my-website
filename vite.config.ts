import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点发布在 https://kuanzhen.github.io/my-website/ 子路径下
  base: '/my-website/',
  plugins: [react(), tailwindcss()],
})
