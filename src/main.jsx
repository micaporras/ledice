import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BoardMonitor } from './utils/boardMonitor/BoardMonitor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BoardMonitor />
    <App />
  </StrictMode>,
)
