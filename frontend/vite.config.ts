import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), 'VITE_') }
  const apiUrl = env.VITE_API_URL

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      allowedHosts: true,
      proxy: {
        '/v1': { target: apiUrl, changeOrigin: true },
        '/storage': { target: apiUrl, changeOrigin: true },
      },
    },
  }
})
