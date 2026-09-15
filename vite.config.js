import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        track: resolve(__dirname, 'track.html'),
        seleccion: resolve(__dirname, 'seleccion.html'),
        contacto: resolve(__dirname, 'contacto.html')
      }
    }
  }
})
