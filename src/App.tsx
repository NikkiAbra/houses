import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Scene } from './components/Scene'

const theme = createTheme({
  palette: {
    background: {
      default: '#f0ede8',
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Scene />
    </ThemeProvider>
  )
}
