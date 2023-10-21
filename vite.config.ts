import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "https://loopworms.io/DEV/LooperLands/Maps/",
        changeOrigin: true,
        secure: false,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': '925rj6wnj754'
        },
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
