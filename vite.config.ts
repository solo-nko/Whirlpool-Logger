import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import tailwindcss from '@tailwindcss/vite'
import vueRouter from 'vue-router/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueRouter(),
    vue(),
    vueDevTools(),
    vuetify({ autoImport: true, styles: { configFile: 'src/assets/styles/settings.scss' } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
