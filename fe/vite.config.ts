import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["brotli-wasm", "brotli-wasm/pkg.bundler/brotli_wasm_bg.wasm"]
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    https: {
      key: 'server.key',
      cert: 'server.crt'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      hooks: path.resolve(__dirname, './src/hooks'),
      components: path.resolve(__dirname, './src/components'),
      interfaces: path.resolve(__dirname, './src/interfaces'),
      styles: path.resolve(__dirname, './src/styles'),
      "simple-peer": "simple-peer/simplepeer.min.js",
    },
  }
})
