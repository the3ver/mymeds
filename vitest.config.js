import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    // This is the key change: force Vuetify to be transformed by Vite during tests
    server: {
      deps: {
        inline: [/vuetify/],
      },
    },
  },
  resolve: {
    alias: [
      { 
        find: '@', 
        replacement: fileURLToPath(new URL('./src', import.meta.url)) 
      },
      // This alias is still needed to handle the CSS files once they are inlined
      { 
        find: /.*\.css$/, 
        replacement: fileURLToPath(new URL('./tests/mocks/style.js', import.meta.url))
      }
    ]
  }
})
