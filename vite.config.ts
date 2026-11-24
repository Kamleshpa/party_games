import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// Smart-TV browsers are often old Chromium builds, so we also ship a legacy bundle.
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'chrome >= 53', 'safari >= 11', 'samsung >= 6'],
    }),
  ],
  build: { target: 'es2017' },
  test: { environment: 'node' },
} as any);
