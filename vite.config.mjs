import { defineConfig } from 'vite'
import { aliases, root } from './scripts/build-support.mjs'

export default defineConfig(({ mode }) => ({
  root,
  // Socket.IO 1.x expects the global alias formerly supplied by Webpack.
  define: { global: 'globalThis' },
  resolve: { alias: aliases },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode !== 'development'
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/socket.io': { target: `http://127.0.0.1:${process.env.PORT || 3000}`, ws: true },
      '/admin': { target: `http://127.0.0.1:${process.env.PORT || 3000}` }
    }
  }
}))
