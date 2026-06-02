import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Build modes:
//   FEDERATED unset (default) — standalone app, outputs index.html + assets.
//   FEDERATED=true            — remote module: outputs remoteEntry.js that a
//                               host consumes via Module Federation. Run via
//                               `npm run build:remote` (or `dev:remote` for HMR).
const isFederated = process.env.FEDERATED === 'true'

const federationPlugin = federation({
  // Host imports as: import("irm/App")
  name: 'irm',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/expose-app.tsx',
  },
  // Singletons MUST be shared so there's exactly one React/router/MSAL
  // instance across host + remote. Mismatched versions log a warning.
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
    // Shared as a singleton so this remote's react-router resolves against the
    // single shared React (a non-shared copy bundles a second React and breaks
    // hooks — "Cannot read properties of null (reading 'useRef')"). This remote
    // is the ONLY app that mounts a <RouterProvider>; the host does no
    // react-router routing, so there's no nested-Router collision.
    'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
    '@azure/msal-browser': { singleton: true, requiredVersion: '^5.0.0' },
    '@azure/msal-react': { singleton: true, requiredVersion: '^5.0.0' },
    // Antd's CSS-in-JS works cross-federation as long as React is shared;
    // sharing it just saves bytes.
    antd: { singleton: true, requiredVersion: '^6.0.0' },
    axios: { singleton: false, requiredVersion: '^1.0.0' },
  },
})

const baseConfig: UserConfig = {
  plugins: [react()],
  // Collapse every `react` / `react-dom` / `react-router-dom` import — including
  // ones inside third-party deps like highcharts-react-official — to a single
  // module. Without this, a pre-bundled dependency can carry its own React copy
  // across the federation boundary, leaving its hooks bound to a React whose
  // dispatcher is null ("Cannot read properties of null (reading 'useRef')").
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('highcharts')) return 'highcharts'
          if (id.includes('antd') || id.includes('@ant-design')) return 'antd'
          if (id.includes('@azure/msal')) return 'msal'
          if (id.includes('react-router')) return 'react-router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react'
          return undefined
        },
      },
    },
  },
}

const federatedConfig: UserConfig = {
  ...baseConfig,
  plugins: [...(baseConfig.plugins ?? []), federationPlugin],
  // Module Federation needs an ESM target + its own chunking strategy, so the
  // manualChunks above are dropped here and the plugin splits as needed.
  build: {
    target: 'esnext',
    // 'oxc' is rolldown-vite's native minifier (avoids pulling esbuild at
    // runtime); the cast keeps the classic-Vite 'esbuild' type happy.
    minify: 'oxc' as 'esbuild',
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'esm' } },
  },
  // Lock the port so the host's remote URL stays stable.
  server: {
    port: 5173,
    strictPort: true,
    cors: { origin: '*' },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  preview: {
    port: 5173,
    strictPort: true,
    cors: { origin: '*' },
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
}

export default defineConfig(isFederated ? federatedConfig : baseConfig)
