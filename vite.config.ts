import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://api:8000', // Changed from localhost to the API service name in Docker
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if your backend doesn't expect /api prefix
      },
    },
  },
});
