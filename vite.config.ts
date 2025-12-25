/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 显式加载环境变量，确保在构建时能被识别
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      crx({ manifest }),
    ],
    define: {
      // 显式定义全局常量，确保某些情况下 import.meta.env 失败时也能访问
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ""),
    },
    build: {
      sourcemap: true,
    },
    server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
