import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './hooks/LangProvider'
import { initAnalytics } from './lib/analytics'
import { watchForUpdates } from './lib/updates'
import { flushWaitlist } from './lib/waitlist'

// No key, no analytics — see the note in lib/analytics.
initAnalytics()
watchForUpdates()
// An address a previous visit could not deliver goes now. Not awaited: nothing
// on screen depends on it, and it must not hold up the first paint.
void flushWaitlist()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
    <Analytics />
  </StrictMode>,
)
