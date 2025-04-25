import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Sitemap from 'vite-plugin-sitemap'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Sitemap({
      hostname: 'https://tripvibes.me',
      robots: [{ userAgent: '*', allow: '/' }],
      readable: true,
      dynamicRoutes: [
        '/',
        '/tos',
        '/privacy-policy',
        '/terms-of-service',
        '/about-us',
        '/contact-us',
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
