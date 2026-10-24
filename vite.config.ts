import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (normalized.includes('node_modules')) {
              if (normalized.includes('/react/') || normalized.includes('/react-dom/')) {
                return 'vendor-react';
              }
              if (normalized.includes('lucide-react') || normalized.includes('motion')) {
                return 'vendor-ui';
              }
              if (normalized.includes('@supabase')) {
                return 'vendor-supabase';
              }
            }
            // Code-split heavy static datasets so the main application code loads instantly
            if (
              normalized.includes('/src/data/venues/') ||
              normalized.includes('/src/lib/seedData') ||
              normalized.includes('/src/lib/delhiLocationsData')
            ) {
              return 'data-venues';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
