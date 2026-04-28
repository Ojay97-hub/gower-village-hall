import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    server: {
      deps: {
        // Force nodemailer through Vite's transform so vi.mock can intercept
        // the require() calls inside the CJS API handlers.
        inline: ['nodemailer'],
      },
    },
  },
})
