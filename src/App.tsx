import { useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'
import { FadeOverlay } from './components/FadeOverlay'

const theme = createTheme()

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Scene onReady={() => setLoaded(true)} />
      <FadeOverlay visible={!loaded} />
    </ThemeProvider>
  )
}
