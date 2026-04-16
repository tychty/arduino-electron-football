import { defineConfig } from 'vite'
import { builtinModules } from 'module'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['electron', ...builtinModules, 'serialport', '@serialport/parser-readline'],
      output: {
        entryFileNames: 'main.js'
      }
    }
  }
})
