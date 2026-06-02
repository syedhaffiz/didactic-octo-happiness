import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
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
})
