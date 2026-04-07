import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'
import { FadeOverlay } from './components/FadeOverlay'
import logoUrl from './assets/logo.svg'

const theme = createTheme()

// ── Logo position & size ─────────────────────────────────────────────────────
const LOGO_TOP   = 32   // px from top
const LOGO_LEFT  = 32   // px from left
const LOGO_WIDTH = 160  // px

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
          top:      LOGO_TOP,
          left:     LOGO_LEFT,
          width:    LOGO_WIDTH,
          height:   'auto',
          zIndex:   10,
          pointerEvents: 'none',
        }}
      />
      <FadeOverlay visible={!loaded} />
    </ThemeProvider>
  )
}
