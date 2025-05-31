import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import './App.css'
import Pages from './pages/pages.js'

function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Pages.LandingPage />} />
          <Route path="colorgame" element={<Pages.ColorGame />} />
          <Route path="colorgame/multiplayer" element={<Pages.Multiplayer />} />
          <Route path="colorgame/singleplayer" element={<Pages.SinglePlayer />} />
          <Route path="colorgame/howto" element={<Pages.HowTo />} />
          <Route path="colormixer" element={<Pages.ColorMixer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
