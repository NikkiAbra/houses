import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'
import { FadeOverlay } from './components/FadeOverlay'
import logoUrl from './assets/logo.svg'

const theme = createTheme()

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Scene onReady={() => setLoaded(true)} />
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
      <FadeOverlay visible={!loaded} />
    </ThemeProvider>
  )
}
