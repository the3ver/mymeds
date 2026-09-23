import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mymeds/',
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png'],
      manifest: {
        name: 'MyMeds',
        short_name: 'MyMeds',
        description: 'MyMeds Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './?utm_source=twa',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        shortcuts: [
          {
            name: 'Medikamente',
            short_name: 'Meds',
            description: 'Medikamentenübersicht öffnen',
            url: './?tab=meds',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Kalender',
            short_name: 'Kalender',
            description: 'Gesundheitstermine und Einnahmeplan öffnen',
            url: './?tab=calendar',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Barcode scannen',
            short_name: 'Scan',
            description: 'Barcode oder Medikationsplan scannen',
            url: './?action=scan',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@zxing')) {
              return 'vendor-zxing'
            }
            if (id.includes('mqtt') || id.includes('peerjs')) {
              return 'vendor-sync'
            }
            if (id.includes('qrcode')) {
              return 'vendor-qrcode'
            }
            if (id.includes('vuetify')) {
              return 'vendor-vuetify'
            }
            if (id.includes('vue') || id.includes('vue-i18n')) {
              return 'vendor-vue'
            }
          }
        }
      }
    }
  }
})