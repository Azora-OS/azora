import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './os.html',  // Changed: os.html is now the main entry point
        index: './index.html',  // Redirect page
        login: './login.html',
        signup: './signup.html',
        onboarding: './onboarding.html',
        dashboard: './dashboard.html',
        learn: './learn.html',
        courses: './courses.html',
        community: './community.html',
        forge: './forge.html',
        prosperity: './prosperity-dashboard.html',
        withdrawal: './withdrawal-confirmation.html'
      }
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    host: true,
    open: '/os.html'  // Changed: Open Azora OS directly
  },
  preview: {
    port: 3001,
    host: true
  }
})