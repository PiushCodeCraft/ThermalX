import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'

import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
// import AdminDashboard from './pages/AdminDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/auth"
          element={<AuthPage />}
        />

        {/* <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        /> */}

      </Routes>
    </BrowserRouter>
  )
}

export default App