import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Фиксируем момент старта приложения для расчёта минимального времени загрузки
;(window as any).__appStartTime = Date.now()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
