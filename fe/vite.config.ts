import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      hooks: path.resolve(__dirname, './src/hooks'),
      components: path.resolve(__dirname, './src/components'),
      interfaces: path.resolve(__dirname, './src/interfaces'),
      styles: path.resolve(__dirname, './src/styles'),
    },
  }
})
