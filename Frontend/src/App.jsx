import React, { useState, useEffect } from 'react';
import AdminDashboard from './pages/admin_dashboard';
import AdminReport from './pages/admin_report';
import AdminUserMgmt from './pages/admin_user_mgmt';
import UserDashboard from './pages/user_dashboard';
import './styles/global.css';

export function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#report') return 'REPORT';
    if (hash === '#user-manage' || hash === '#users') return 'USER MANAGE';
    if (hash === '#user' || hash === '#user-dashboard') return 'USER DASHBOARD';
    return 'DASHBOARD';
  };

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
}


export default App;