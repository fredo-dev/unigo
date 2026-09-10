import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    rollupOptions: {
      // Exclut uniquement les modules Node/Serveur stricts du bundle frontend
      external: [
        'express', 
        'drizzle-orm', 
        '@types/express', 
        '@types/pg', 
        '@firebase/eslint-plugin-security-rules'
      ],
    },
  },
});
