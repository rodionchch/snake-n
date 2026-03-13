import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@engine':     resolve(__dirname, 'src/engine'),
      '@entities':   resolve(__dirname, 'src/entities'),
      '@systems':    resolve(__dirname, 'src/systems'),
      '@components': resolve(__dirname, 'src/components'),
      '@store':      resolve(__dirname, 'src/store'),
      '@utils':      resolve(__dirname, 'src/utils'),
    },
  },
})
