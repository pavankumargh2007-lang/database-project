import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          customers: path.resolve(__dirname, 'customers.html'),
          bookings: path.resolve(__dirname, 'bookings.html'),
          jobcards: path.resolve(__dirname, 'jobcards.html'),
          billing: path.resolve(__dirname, 'billing.html'),
          inventory: path.resolve(__dirname, 'inventory.html'),
          staff: path.resolve(__dirname, 'staff.html'),
          notifications: path.resolve(__dirname, 'notifications.html'),
          reports: path.resolve(__dirname, 'reports.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
