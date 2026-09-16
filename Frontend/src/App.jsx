import React, { useState } from "react";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Feedback from "./pages/Feedback";

import DashboardLayout from "./components/layout/DashboardLayout";

import LiveMap from "./pages/LiveMap";
import Alerts from "./pages/Alerts";

import "./App.css";


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState("basic");
  const [feedbacks, setFeedbacks] = useState([]);


  /* =====================================================
     SIDEBAR NAVIGATION
  ===================================================== */

  const handleNavigate = (page) => {
    const routes = {
      "live-map": "/live-map",
      alerts: "/alerts",
      "ai-analysis": "/ai-analysis",
      reports: "/reports",
      users: "/users",
      system: "/system",
    };

    if (routes[page]) {
      navigate(routes[page]);
    }
  };


  /* =====================================================
     FEEDBACK
  ===================================================== */

  const handleSubmitFeedback = (feedback) => {
    setFeedbacks((previous) => [
      ...previous,
      feedback,
    ]);
  };


  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = (selectedRole = "basic") => {
    setRole(selectedRole);
    navigate("/live-map");
  };


  /* =====================================================
     LANDING
  ===================================================== */

  if (location.pathname === "/") {
    return <LandingPage />;
  }


  /* =====================================================
     FEEDBACK
  ===================================================== */

  if (location.pathname === "/feedback") {
    return (
      <Feedback
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }


  /* =====================================================
     AUTH
  ===================================================== */

  if (location.pathname === "/auth") {
    return (
      <AuthPage
        onLogin={handleLogin}
      />
    );
  }


  /* =====================================================
     LIVE MAP
  ===================================================== */

  if (location.pathname === "/live-map") {
    return (
      <DashboardLayout
        role={role}
        activePage="live-map"
        onNavigate={handleNavigate}
      >
        <LiveMap
          role={role}
        />
      </DashboardLayout>
    );
  }


  /* =====================================================
     ALERTS
  ===================================================== */

  if (location.pathname === "/alerts") {
    return (
      <DashboardLayout
        role={role}
        activePage="alerts"
        onNavigate={handleNavigate}
      >
        <Alerts
          role={role}
          feedbacks={feedbacks}
        />
      </DashboardLayout>
    );
  }


  /* =====================================================
     AI ANALYSIS
  ===================================================== */

  if (location.pathname === "/ai-analysis") {
    return (
      <DashboardLayout
        role={role}
        activePage="ai-analysis"
        onNavigate={handleNavigate}
      >
        <div className="tx-placeholder-page">
          <h1>AI Analysis</h1>

          <p>
            AI analysis module will be connected here.
          </p>
        </div>
      </DashboardLayout>
    );
  }


  /* =====================================================
     REPORTS
  ===================================================== */

  if (location.pathname === "/reports") {
    return (
      <DashboardLayout
        role={role}
        activePage="reports"
        onNavigate={handleNavigate}
      >
        <div className="tx-placeholder-page">
          <h1>Reports</h1>

          <p>
            Reports module will be connected here.
          </p>
        </div>
      </DashboardLayout>
    );
  }


  /* =====================================================
     USERS
  ===================================================== */

  if (location.pathname === "/users") {
    return (
      <DashboardLayout
        role={role}
        activePage="users"
        onNavigate={handleNavigate}
      >
        <div className="tx-placeholder-page">
          <h1>Users</h1>

          <p>
            User management module will be connected here.
          </p>
        </div>
      </DashboardLayout>
    );
  }


  /* =====================================================
     SYSTEM
  ===================================================== */

  if (location.pathname === "/system") {
    return (
      <DashboardLayout
        role={role}
        activePage="system"
        onNavigate={handleNavigate}
      >
        <div className="tx-placeholder-page">
          <h1>System</h1>

          <p>
            System settings will be connected here.
          </p>
        </div>
      </DashboardLayout>
    );
  }


  /* =====================================================
     FALLBACK
  ===================================================== */

  navigate("/");

  return null;
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App;