import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Semua request yang diawali dengan '/digicam' akan dialihkan ke digicamcontrol
      '/digicam': {
        target: 'http://localhost:5513',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/digicam/, '') // Menghapus teks /digicam saat dikirim ke target
      }
    }
  }
})
