import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

import LiveMap from "./pages/LiveMap";
import Alerts from "./pages/Alerts";

import Feedback from "./pages/Feedback";

import AboutThermalX from "./pages/AboutThermalX";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";

import DashboardLayout from "./components/layout/DashboardLayout";


/* =========================================================
   ADMIN IMPORTS
========================================================= */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AdminLiveMap from "./pages/admin/AdminLiveMap";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AIAnalysis from "./pages/admin/AIAnalysis";
import Reports from "./pages/admin/Reports";
import Users from "./pages/admin/Users";
import FeedbackAdmin from "./pages/admin/Feedback";
import System from "./pages/admin/System";


import "./App.css";


/* =========================================================
   BASIC USER PAGE WRAPPER
========================================================= */

const BasicUserPage = ({
  children,
  activePage,
}) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      role="basic"
      activePage={activePage}
      onNavigate={(page) => {

        if (page === "live-map") {
          navigate("/live-map");
        }

        if (page === "alerts") {
          navigate("/alerts");
        }

      }}
    >
      {children}
    </DashboardLayout>
  );
};


/* =========================================================
   ADMIN PAGE WRAPPER
========================================================= */

const AdminPage = ({
  children,
  activePage,
}) => {
  return (
    <AdminDashboardLayout
      activePage={activePage}
    >
      {children}
    </AdminDashboardLayout>
  );
};


/* =========================================================
   APP CONTENT
========================================================= */

const AppContent = ({
  feedbacks,
  onSubmitFeedback,
}) => {

  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin");


  return (
    <Routes>

      {/* ===================================================
          LANDING
      =================================================== */}

      <Route
        path="/"
        element={
          <LandingPage />
        }
      />


      {/* ===================================================
          LOGIN
      =================================================== */}

     <Route
      path="/login"
      element={
       <AuthPage
        onLogin={(role) => {
          if (role === "admin") {
          window.location.href = "/admin";
            } 
        }
      }
    />
  }
/>


      {/* ===================================================
          BASIC USER - LIVE MAP
      =================================================== */}

      <Route
        path="/live-map"
        element={
          <BasicUserPage
            activePage="live-map"
          >
            <LiveMap />
          </BasicUserPage>
        }
      />


      {/* ===================================================
          BASIC USER - ALERTS
      =================================================== */}

      <Route
        path="/alerts"
        element={
          <BasicUserPage
            activePage="alerts"
          >
            <Alerts />
          </BasicUserPage>
        }
      />


      {/* ===================================================
          PUBLIC FEEDBACK
      =================================================== */}

      <Route
        path="/feedback"
        element={
          <Feedback
            onSubmitFeedback={
              onSubmitFeedback
            }
          />
        }
      />


      {/* ===================================================
          SUPPORT PAGES
      =================================================== */}

      <Route
        path="/about"
        element={
          <AboutThermalX />
        }
      />

      <Route
        path="/privacy-policy"
        element={
          <PrivacyPolicy />
        }
      />

      <Route
        path="/terms-of-use"
        element={
          <TermsOfUse />
        }
      />


      {/* ===================================================
          ADMIN DASHBOARD
      =================================================== */}

      <Route
        path="/admin"
        element={
          <AdminPage
            activePage="dashboard"
          >
            <AdminDashboard />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN LIVE MAP
      =================================================== */}

      <Route
        path="/admin/live-map"
        element={
          <AdminPage
            activePage="live-map"
          >
            <AdminLiveMap />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN ALERTS
      =================================================== */}

      <Route
        path="/admin/alerts"
        element={
          <AdminPage
            activePage="alerts"
          >
            <AdminAlerts />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN AI ANALYSIS
      =================================================== */}

      <Route
        path="/admin/ai-analysis"
        element={
          <AdminPage
            activePage="ai-analysis"
          >
            <AIAnalysis />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN REPORTS
      =================================================== */}

      <Route
        path="/admin/reports"
        element={
          <AdminPage
            activePage="reports"
          >
            <Reports />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN USERS
      =================================================== */}

      <Route
        path="/admin/users"
        element={
          <AdminPage
            activePage="users"
          >
            <Users />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN FEEDBACK
      =================================================== */}

      <Route
        path="/admin/feedback"
        element={
          <AdminPage
            activePage="feedback"
          >
            <FeedbackAdmin
              feedbacks={feedbacks}
            />
          </AdminPage>
        }
      />


      {/* ===================================================
          ADMIN SYSTEM
      =================================================== */}

      <Route
        path="/admin/system"
        element={
          <AdminPage
            activePage="system"
          >
            <System />
          </AdminPage>
        }
      />


      {/* ===================================================
          FALLBACK
      =================================================== */}

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
  );
};


/* =========================================================
   APP
========================================================= */

const App = () => {

  const [feedbacks, setFeedbacks] = useState([]);


  const handleSubmitFeedback = (
    feedback
  ) => {

    setFeedbacks((previous) => [
      ...previous,
      {
        ...feedback,
        status: "New",
      },
    ]);

  };


  return (
    <BrowserRouter>

      <AppContent
        feedbacks={feedbacks}
        onSubmitFeedback={
          handleSubmitFeedback
        }
      />

    </BrowserRouter>
  );
};


export default App;