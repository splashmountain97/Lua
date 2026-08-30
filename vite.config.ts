import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Lua — a question, once a day',
        short_name: 'Lua',
        description: 'A shake-to-reveal daily reflection prompt.',
        theme_color: '#161826',
        background_color: '#0e0f18',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.jpg', sizes: '192x192', type: 'image/jpeg' },
          { src: 'icon-512.jpg', sizes: '512x512', type: 'image/jpeg' },
          { src: 'icon-512-maskable.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
