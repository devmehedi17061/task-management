import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { cwd: () => string };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_APPS_SCRIPT_URL;
  // Proxy /gas → Apps Script /exec to dodge browser CORS/redirect quirks in dev.
  const targetPath = target ? extractPath(target) : '';
  return {
    base: '/task-management/',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: target
        ? {
            '/gas': {
              target: 'https://script.google.com',
              changeOrigin: true,
              secure: true,
              followRedirects: true,
              rewrite: (path) => path.replace(/^\/gas/, targetPath),
            },
          }
        : undefined,
    },
  };
});

function extractPath(fullUrl: string): string {
  // Strip protocol + host without depending on the URL global.
  const match = fullUrl.match(/^https?:\/\/[^/]+(\/.*)$/);
  return match ? match[1].split('?')[0].split('#')[0] : '';
}
