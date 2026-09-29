import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://helping.group',
  output: 'static',
  integrations: [sitemap()],
  redirects: {
    '/team': '/about#founder',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
