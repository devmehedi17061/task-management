import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    base: '/task-management/',
    plugins: [react()],
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/api': 'http://localhost:4000',
        },
    },
});
