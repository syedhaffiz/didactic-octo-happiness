import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Module Federation HOST.
//
// Consumes the IRM remote's exposed `./App`. The remote must be
// running (npm --prefix frontend run dev:remote) so its remoteEntry.js is
// reachable at the `entry` URL below.
export default defineConfig({
  // Keep React a single instance even when pulled in by third-party deps, so
  // the shared singleton isn't shadowed by a bundled copy.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        // Matches the remote's `name` in frontend/vite.config.ts.
        irm: {
          type: 'module',
          name: 'irm',
          entry: 'http://localhost:5173/remoteEntry.js',
          entryGlobalName: 'irm',
          shareScope: 'default',
        },
      },
      // Must match the remote's shared singletons so there's exactly one copy
      // of each across host + remote.
      // react-router-dom is intentionally absent: the host does no react-router
      // routing (it switches views via the History API). The remote is the only
      // app that mounts a router and shares it as a singleton.
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        '@azure/msal-browser': { singleton: true, requiredVersion: '^5.0.0' },
        '@azure/msal-react': { singleton: true, requiredVersion: '^5.0.0' },
        antd: { singleton: true, requiredVersion: '^6.0.0' },
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'oxc' as 'esbuild',
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
})
