import React from "react";

import {
  Map,
  Bell,
  BrainCircuit,
  FileText,
  Settings,
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = ({
  role = "basic",
  activePage = "dashboard",
  onNavigate,
}) => {
  const isAdmin = role === "admin";

  const mainNavigation = [
    {
      id: "live-map",
      label: "Live Map",
      icon: Map,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
    },
  ];

  const adminNavigation = [
    {
      id: "ai-analysis",
      label: "AI Analysis",
      icon: BrainCircuit,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
    },
    {
      id: "system",
      label: "System",
      icon: Settings,
    },
  ];

  const handleNavigation = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  };

  const renderNavigation = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = activePage === item.id;

      return (
        <button
          key={item.id}
          type="button"
          className={`tx-sidebar-item ${
            isActive ? "active" : ""
          }`}
          onClick={() => handleNavigation(item.id)}
        >
          <Icon
            className="tx-sidebar-item-icon"
            size={20}
          />

          <span className="tx-sidebar-item-text">
            {item.label}
          </span>
        </button>
      );
    });
  };

  return (
    <aside className="tx-sidebar">

      {/* =========================
          LOGO
      ========================= */}

      <div className="tx-sidebar-brand">
        <button
          type="button"
          className="tx-sidebar-brand-button"
          onClick={() => handleNavigation("dashboard")}
          aria-label="THERMAL-X Home"
        >
          <img
            src="/assets/thermal-x-logo.png"
            alt="THERMAL-X"
            className="tx-sidebar-logo"
          />
        </button>
      </div>


      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="tx-sidebar-nav">

        {/* MAIN MENU */}

        <section className="tx-sidebar-section">

          <h3 className="tx-sidebar-section-title">
            Main Menu
          </h3>

          <div className="tx-sidebar-menu">
            {renderNavigation(mainNavigation)}
          </div>

        </section>


        {/* ADMINISTRATION */}

        {isAdmin && (
          <section className="tx-sidebar-section">

            <h3 className="tx-sidebar-section-title">
              Administration
            </h3>

            <div className="tx-sidebar-menu">
              {renderNavigation(adminNavigation)}
            </div>

          </section>
        )}

      </nav>


      {/* =========================
          FOOTER
      ========================= */}

      <div className="tx-sidebar-footer">

        <div className="tx-sidebar-nameplate">

          <center>
            <h5 className="tx-sidebar-nameplate-title">
              <b>THERMAL-X</b>
            </h5>

            <p className="tx-sidebar-nameplate-subtitle">
              Thermal Imaging & AI Analysis
            </p>
          </center>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;