import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-fuelprice': {
        target: 'https://api.data.gov.my/data-catalogue?id=fuelprice',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
})
