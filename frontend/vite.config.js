import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SRC = new URL('./src', import.meta.url).pathname;

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: { alias: { '@': SRC } },

  // --- BLOQUE PROXY FINAL (CUATRO MICROSERVICIOS) ---
  server: {
    proxy: {
      // 1. Identidad (Login, Registro) - Puerto 8080
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      // 2. Catálogo (Productos, Categorías) - Puerto 8081
      '/api/productos': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/categorias': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },

      // 3. Órdenes (Checkout, Boletas) - Puerto 8082
      '/api/checkout': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/boletas': { 
        target: 'http://localhost:8082',
        changeOrigin: true,
      },

      // 4. Reportes - Puerto 8083
      '/api/reportes': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    }
  },
  // --- FIN BLOQUE PROXY ---
  
  define: { /* ... */ },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: '__test__/setupTests.js',
    alias: { '@': SRC },

    reporters: ['default', 'html', 'json'],
    outputFile: {
      html: './html/index.html',
      json: './vitest-report.json'
    }
  },
}));