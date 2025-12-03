import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    root: path.join(__dirname, 'src/renderer'),
    build: {
        outDir: '../../dist/renderer',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    }
});
