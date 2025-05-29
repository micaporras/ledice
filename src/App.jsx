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
          <Route path="/colorgame" element={<Pages.ColorGame />} />
          <Route path="/colormixer" element={<Pages.ColorMixer />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
