import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/kodi': {
        target: 'http://10.0.0.54:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/kodi/, ''),
      },
    },
  },
});