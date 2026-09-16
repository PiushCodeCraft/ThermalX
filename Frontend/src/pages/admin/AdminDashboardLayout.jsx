import React from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminDashboardLayout.css";

const AdminDashboardLayout = ({
  children,
  activePage = "dashboard",
}) => {
  return (
    <div className="tx-admin-dashboard-layout">

      <AdminSidebar
        activePage={activePage}
      />

      <div className="tx-admin-dashboard-main">

        <main className="tx-admin-dashboard-page">
          {children}
        </main>

      </div>

    </div>
  );
};

export default AdminDashboardLayout;