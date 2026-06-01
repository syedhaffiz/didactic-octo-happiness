import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Build modes:
//   FEDERATED=false (default) — standalone app, output index.html + assets.
//   FEDERATED=true            — remote module: outputs remoteEntry.js that
//                               a host can consume via Module Federation.
//                               Run via `npm run build:remote` (or
//                               `npm run dev:remote` for HMR).
const isFederated = process.env.FEDERATED === 'true'

const federationPlugin = federation({
  // Host imports as: import("control_tower/App")
  // Pick a name unique to this remote across all your microfrontends.
  name: 'control_tower',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/expose-app.tsx',
  },
  // Singletons MUST be shared so there's exactly one React/router/MSAL
  // instance across host + remote. Mismatched versions log a warning.
  // Non-singleton entries are deduped when versions match, otherwise both
  // copies coexist.
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
    'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
    '@azure/msal-browser': { singleton: true, requiredVersion: '^5.0.0' },
    '@azure/msal-react': { singleton: true, requiredVersion: '^5.0.0' },
    // Antd's CSS-in-JS works cross-federation as long as React is shared.
    // Sharing it just saves bytes.
    antd: { singleton: true, requiredVersion: '^6.0.0' },
    axios: { singleton: false, requiredVersion: '^1.0.0' },
  },
})

const baseConfig: UserConfig = {
  plugins: [react()],
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
  // Module Federation needs ESM target + its own chunking strategy.
  // Disabling manualChunks here so the plugin can split as needed.
  build: {
    target: 'esnext',
    // 'oxc' is rolldown-vite's native minifier (avoids pulling esbuild at
    // runtime); fall back to 'esbuild' on classic Vite.
    minify: 'oxc' as 'esbuild',
    cssCodeSplit: false,
    rollupOptions: { output: { format: 'esm' } },
  },
  // Lock the port so the host's `entry` URL is stable. strictPort makes the
  // dev server fail loudly if 5173 is occupied, rather than silently bumping
  // to 5174 and breaking the host's hard-coded remote URL.
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
