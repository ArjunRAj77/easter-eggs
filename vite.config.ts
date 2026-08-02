import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(dir, './src') },
  },
  build: {
    target: 'es2022',
    // The syntax highlighter and its grammars dwarf everything else in the
    // bundle. Splitting them out means the shell and the gallery can paint
    // while the code-view chunk is still arriving.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          highlighter: ['react-syntax-highlighter'],
        },
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
