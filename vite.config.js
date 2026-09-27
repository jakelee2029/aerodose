import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('leaflet')) return 'vendor-leaflet';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-recharts';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
        },
      },
    },
  },
})


