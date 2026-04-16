import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src')
    }
  }
})
