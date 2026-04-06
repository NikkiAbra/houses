import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { SceneProvider } from './context/SceneContext'
import { Scene } from './components/Scene'
import { ControlPanel } from './components/ControlPanel'

const theme = createTheme()

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SceneProvider>
        <Scene />
        <ControlPanel />
      </SceneProvider>
    </ThemeProvider>
  )
}
