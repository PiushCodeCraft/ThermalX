import React from "react";

import {
  LayoutDashboard,
  Map,
  Bell,
  BrainCircuit,
  FileText,
  Users,
  MessageSquare,
  Settings,
  Home,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./AdminSidebar.css";

const AdminSidebar = ({
  activePage = "dashboard",
}) => {
  const navigate = useNavigate();

  /* =========================================================
     MAIN NAVIGATION
  ========================================================= */

  const mainNavigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      id: "live-map",
      label: "Live Map",
      icon: Map,
      path: "/admin/live-map",
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      path: "/admin/alerts",
    },
  ];

  /* =========================================================
     ADMINISTRATION NAVIGATION
  ========================================================= */

  const adminNavigation = [
    {
      id: "ai-analysis",
      label: "AI Analysis",
      icon: BrainCircuit,
      path: "/admin/ai-analysis",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
    },
    // {
    //   id: "users",
    //   label: "Users",
    //   icon: Users,
    //   path: "/admin/users",
    // },
    {
      id: "feedback",
      label: "User Feedback",
      icon: MessageSquare,
      path: "/admin/feedback",
    },
    {
      id: "system",
      label: "System",
      icon: Settings,
      path: "/admin/system",
    },
  ];

  /* =========================================================
     NAVIGATION RENDER
  ========================================================= */

  const renderNavigation = (items) => {
    return items.map((item) => {
      const Icon = item.icon;

      const isActive =
        activePage === item.id;

      return (
        <button
          key={item.id}
          type="button"
          className={`tx-admin-sidebar-item ${
            isActive ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
        >
          <Icon
            className="tx-admin-sidebar-item-icon"
            size={19}
          />

          <span className="tx-admin-sidebar-item-text">
            {item.label}
          </span>
        </button>
      );
    });
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  return (
    <aside className="tx-admin-sidebar">

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className="tx-admin-sidebar-brand">

        <button
          type="button"
          className="tx-admin-sidebar-brand-button"
          onClick={() => navigate("/")}
          aria-label="THERMAL-X Home"
        >
          <img
            src="/assets/thermal-x-logo.png"
            alt="THERMAL-X"
            className="tx-admin-sidebar-logo"
          />
        </button>

      </div>


      {/* =====================================================
          ADMIN ROLE
      ===================================================== */}

      <div className="tx-admin-sidebar-role">

        <span className="tx-admin-sidebar-role-dot" />

        ADMINISTRATOR

      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="tx-admin-sidebar-nav">

        {/* ===================================================
            MAIN MENU
        =================================================== */}

        <section className="tx-admin-sidebar-section">

          <h3 className="tx-admin-sidebar-section-title">
            Main Menu
          </h3>

          <div className="tx-admin-sidebar-menu">

            {renderNavigation(
              mainNavigation
            )}

          </div>

        </section>


        {/* ===================================================
            ADMINISTRATION
        =================================================== */}

        <section className="tx-admin-sidebar-section">

          <h3 className="tx-admin-sidebar-section-title">
            Administration
          </h3>

          <div className="tx-admin-sidebar-menu">

            {renderNavigation(
              adminNavigation
            )}

          </div>

        </section>

      </nav>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="tx-admin-sidebar-footer">

        <button
          type="button"
          className="tx-admin-sidebar-home"
          onClick={() => navigate("/")}
        >
          <Home size={16} />

          <span>
            Back to Home
          </span>

        </button>


        <div className="tx-admin-sidebar-nameplate">

          <strong>
            THERMAL-X
          </strong>

          <span>
            Administrative Console
          </span>

        </div>

      </div>

    </aside>
  );
};

export default AdminSidebar;