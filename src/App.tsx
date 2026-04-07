import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'
import { FadeOverlay } from './components/FadeOverlay'
import { LoadingIcon } from './components/LoadingIcon'
import logoUrl from './assets/logo.svg'

const theme = createTheme()

const MIN_LOADING_MS = 1000  // минимальное время показа загрузки

export default function App() {
  const [loaded, setLoaded] = useState(false)

  const handleReady = () => {
    const start   = (window as any).__appStartTime ?? Date.now()
    const elapsed = Date.now() - start
    const delay   = Math.max(0, MIN_LOADING_MS - elapsed)
    setTimeout(() => setLoaded(true), delay)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Scene onReady={handleReady} />
      <img
        src={logoUrl}
        alt="logo"
        style={{
          position: 'fixed',
          // ── desktop ──────────────────────────
          top:   32,    // px from top
          left:  32,    // px from left
          width: 160,   // px
          // ── overrides applied via media query in index.css ──
          height:        'auto',
          zIndex:        10,
          pointerEvents: 'none',
        }}
      />
      <LoadingIcon visible={!loaded} />
      <FadeOverlay visible={!loaded} />
    </ThemeProvider>
  )
}
