import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Host runs on port 3000 so its origin (http://localhost:3000) is distinct
// from the remote (http://localhost:5173). The remote URL is configurable
// via VITE_CONTROL_TOWER_REMOTE so the same build can point at a staging
// or prod remoteEntry.
export default defineConfig({
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        // The remote ID `control_tower` matches the `name` field in the
        // remote's federation config. Imports use `<id>/<exposeKey>`:
        //   import('control_tower/App')  →  pulls ./App from this remote.
        control_tower: {
          type: 'module',
          entry:
            (import.meta as unknown as { env: Record<string, string> }).env
              ?.VITE_CONTROL_TOWER_REMOTE ??
            'http://localhost:5173/remoteEntry.js',
        },
      },
      // Singletons MUST match between host + remote, or React will see two
      // copies of itself and complain about hooks / context loudly. MSAL
      // singleton is critical for the shared sign-in state.
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
        '@azure/msal-browser': { singleton: true, requiredVersion: '^5.0.0' },
        '@azure/msal-react': { singleton: true, requiredVersion: '^5.0.0' },
        antd: { singleton: true, requiredVersion: '^6.0.0' },
      },
    }),
  ],
  build: { target: 'esnext' },
})
