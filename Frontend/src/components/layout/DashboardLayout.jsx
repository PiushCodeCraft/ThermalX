import React from "react";
import Sidebar from "./Sidebar";

import "./DashboardLayout.css";

const DashboardLayout = ({
  children,
  role = "basic",
  activePage,
  onNavigate,
}) => {
  return (
    <div className="tx-dashboard-layout">

      <Sidebar
        role={role}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="tx-dashboard-main">

        <main className="tx-dashboard-page">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;