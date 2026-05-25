import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split heavyweight vendors into their own chunks so they don't bloat the
    // entry bundle and can be cached independently across page navigations.
    // Highcharts in particular is large and only needed by chart-bearing pages.
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('highcharts')) return 'highcharts'
          if (id.includes('antd') || id.includes('@ant-design')) return 'antd'
          if (id.includes('react-router')) return 'react-router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react'
          return undefined
        },
      },
    },
  },
})
