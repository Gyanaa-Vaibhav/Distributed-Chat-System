import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = env.VITE_FRONTEND_PORT || '8173';

  return {
    plugins: [react()],
    server: {
      port: Number(port),
      host: '0.0.0.0',
    },
  };
});