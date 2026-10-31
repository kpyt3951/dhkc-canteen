import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rawAppUrl = process.env.APP_URL || '';
  const sharedAppUrl = rawAppUrl.replace('ais-dev-', 'ais-pre-') || 'https://ais-pre-we7bk24s6gh6ph5tnom2q3-388743997822.asia-southeast1.run.app';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SHARED_APP_URL': JSON.stringify(sharedAppUrl),
      'import.meta.env.VITE_DEV_APP_URL': JSON.stringify(rawAppUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
