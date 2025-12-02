import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // Setting base to './' ensures assets load correctly on GitHub Pages
    // regardless of the repository name (e.g. username.github.io/repo-name)
    base: './', 
    define: {
      // Shim process.env for the Google GenAI SDK usage in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});