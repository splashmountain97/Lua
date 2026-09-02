import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { watchForUpdates } from './lib/updates'

// No key, no analytics — see the note in lib/analytics.
initAnalytics()
watchForUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
