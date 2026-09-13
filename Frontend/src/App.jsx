import "./App.css";

import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";



function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Authentication Page */}
        <Route
          path="/auth"
          element={<AuthPage />}
        />

        {/* Any invalid URL → Home */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;