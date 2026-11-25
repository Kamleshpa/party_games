import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Serves the Vercel function api/realtime-token.js during `npm run dev` (reads ABLY_API_KEY from .env.local). */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/realtime-token', async (req, res) => {
        try {
          const mod = await import(pathToFileURL(resolve(process.cwd(), 'api/realtime-token.js')).href);
          const url = new URL(req.url || '/', 'http://localhost');
          const shim: any = {
            setHeader: (k: string, v: string) => res.setHeader(k, v),
            status(code: number) {
              res.statusCode = code;
              return shim;
            },
            json(body: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(body));
            },
          };
          await mod.default({ query: Object.fromEntries(url.searchParams.entries()) }, shim);
        } catch {
          res.statusCode = 500;
          res.end('local api error');
        }
      });
    },
  };
}

// Smart-TV browsers are often old Chromium builds, so we also ship a legacy bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.ABLY_API_KEY && !process.env.ABLY_API_KEY) process.env.ABLY_API_KEY = env.ABLY_API_KEY;
  const build = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'dev-' + Date.now().toString(36);
  return {
    plugins: [
      react(),
      legacy({
        targets: ['defaults', 'chrome >= 53', 'safari >= 11', 'samsung >= 6'],
      }),
      localApi(),
    ],
    define: { __BUILD_ID__: JSON.stringify(build) },
    build: { target: 'es2017' },
    test: { environment: 'node' },
  } as any;
});
