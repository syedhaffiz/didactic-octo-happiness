import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { bootstrapAuth } from './auth/bootstrap'

bootstrapAuth().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
