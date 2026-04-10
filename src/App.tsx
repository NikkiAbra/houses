import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'
import { FadeOverlay } from './components/FadeOverlay'
import { LoadingIcon } from './components/LoadingIcon'
import logoUrl from './assets/logo.svg'

const theme = createTheme()

const MIN_LOADING_MS = 1000


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

      {/* UI поверх canvas */}
      <img
        src={logoUrl}
        alt="logo"
        style={{
          position:      'fixed',
          top:            32,
          left:           32,
          width:          160,
          height:        'auto',
          zIndex:         10,
          pointerEvents: 'none',
        }}
      />
      <LoadingIcon visible={!loaded} />
      <FadeOverlay visible={!loaded} />
    </ThemeProvider>
  )
}
