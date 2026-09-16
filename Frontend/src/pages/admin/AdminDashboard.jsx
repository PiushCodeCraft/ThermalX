import React from "react";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileText,
  Map,
  Users,
} from "lucide-react";

import IndiaFocusedMap from "../../components/map/IndiaFocusedMap";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Active Incidents",
      value: "24",
      detail: "Currently detected",
      icon: AlertTriangle,
    },
    {
      title: "Thermal Detections",
      value: "186",
      detail: "Last 24 hours",
      icon: Activity,
    },
    {
      title: "AI Analyses",
      value: "73",
      detail: "Completed today",
      icon: BrainCircuit,
    },
    {
      title: "Registered Users",
      value: "1,248",
      detail: "Total users",
      icon: Users,
    },
  ];

  const handleViewMap = () => {
    window.location.href = "/admin/live-map";
  };

  return (
    <div className="tx-admin-dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="tx-admin-dashboard-header">

        <div>
          <span className="tx-admin-dashboard-eyebrow">
            THERMAL-X / ADMINISTRATION
          </span>

          <h1>
            Administrative Dashboard
          </h1>

          <p>
            Monitor thermal incidents, AI analysis,
            reports and system activity.
          </p>
        </div>

        <div className="tx-admin-system-status">
          <span className="tx-admin-status-dot" />

          SYSTEM OPERATIONAL
        </div>

      </header>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="tx-admin-statistics">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <article
              className="tx-admin-stat-card"
              key={stat.title}
            >

              <div className="tx-admin-stat-icon">
                <Icon size={20} />
              </div>

              <div className="tx-admin-stat-content">

                <span className="tx-admin-stat-title">
                  {stat.title}
                </span>

                <strong className="tx-admin-stat-value">
                  {stat.value}
                </strong>

                <span className="tx-admin-stat-detail">
                  {stat.detail}
                </span>

              </div>

            </article>
          );
        })}

      </section>


      {/* =====================================================
          MAP + SYSTEM STATUS
      ===================================================== */}

      <section className="tx-admin-dashboard-grid">

        {/* ---------------------------------------------------
            REAL NASA FIRMS MAP
        --------------------------------------------------- */}

        <article className="tx-admin-map-card">

          <div className="tx-admin-card-header">

            <div>

              <span className="tx-admin-card-eyebrow">
                MONITORING
              </span>

              <h2>
                Thermal Risk Map
              </h2>

            </div>

            <button
              type="button"
              className="tx-admin-view-map-button"
              onClick={handleViewMap}
            >
              <Map size={16} />

              VIEW MAP
            </button>

          </div>

          <div className="tx-admin-map-container">

            <IndiaFocusedMap />

          </div>

        </article>


        {/* ---------------------------------------------------
            SYSTEM STATUS
        --------------------------------------------------- */}

        <article className="tx-admin-system-card">

          <div className="tx-admin-card-header">

            <div>

              <span className="tx-admin-card-eyebrow">
                SYSTEM
              </span>

              <h2>
                System Status
              </h2>

            </div>

          </div>


          <div className="tx-admin-system-list">

            <div className="tx-admin-system-row">
              <span>
                NASA FIRMS Data
              </span>

              <strong>
                ONLINE
              </strong>
            </div>


            <div className="tx-admin-system-row">
              <span>
                AI Detection Model
              </span>

              <strong>
                ACTIVE
              </strong>
            </div>


            <div className="tx-admin-system-row">
              <span>
                Thermal Data Collector
              </span>

              <strong>
                RUNNING
              </strong>
            </div>


            <div className="tx-admin-system-row">
              <span>
                Alert Processing
              </span>

              <strong>
                ACTIVE
              </strong>
            </div>


            <div className="tx-admin-system-row">
              <span>
                Database
              </span>

              <strong>
                CONNECTED
              </strong>
            </div>

          </div>

        </article>

      </section>


      {/* =====================================================
          LOWER DASHBOARD
      ===================================================== */}

      <section className="tx-admin-lower-grid">

        {/* ---------------------------------------------------
            RECENT INCIDENTS
        --------------------------------------------------- */}

        <article className="tx-admin-panel">

          <div className="tx-admin-card-header">

            <div>

              <span className="tx-admin-card-eyebrow">
                INCIDENTS
              </span>

              <h2>
                Recent Incidents
              </h2>

            </div>

            <span className="tx-admin-live-label">
              LIVE
            </span>

          </div>


          <div className="tx-admin-incident-list">

            <div className="tx-admin-incident-row">

              <span className="tx-admin-incident-time">
                10:42
              </span>

              <div>

                <strong>
                  Thermal anomaly detected
                </strong>

                <span>
                  Northern India monitoring region
                </span>

              </div>

              <b className="high">
                HIGH
              </b>

            </div>


            <div className="tx-admin-incident-row">

              <span className="tx-admin-incident-time">
                10:36
              </span>

              <div>

                <strong>
                  Fire detection confirmed
                </strong>

                <span>
                  Satellite thermal observation
                </span>

              </div>

              <b className="medium">
                MEDIUM
              </b>

            </div>


            <div className="tx-admin-incident-row">

              <span className="tx-admin-incident-time">
                10:21
              </span>

              <div>

                <strong>
                  Thermal activity detected
                </strong>

                <span>
                  Central monitoring region
                </span>

              </div>

              <b className="low">
                LOW
              </b>

            </div>

          </div>

        </article>


        {/* ---------------------------------------------------
            ADMIN ACTIVITY
        --------------------------------------------------- */}

        <article className="tx-admin-panel">

          <div className="tx-admin-card-header">

            <div>

              <span className="tx-admin-card-eyebrow">
                ADMIN ACTIVITY
              </span>

              <h2>
                Recent Activity
              </h2>

            </div>

          </div>


          <div className="tx-admin-activity-list">

            <div className="tx-admin-activity-row">

              <BrainCircuit size={17} />

              <div>

                <strong>
                  AI analysis completed
                </strong>

                <span>
                  10:36 AM
                </span>

              </div>

            </div>


            <div className="tx-admin-activity-row">

              <FileText size={17} />

              <div>

                <strong>
                  Report generated
                </strong>

                <span>
                  10:28 AM
                </span>

              </div>

            </div>


            <div className="tx-admin-activity-row">

              <Users size={17} />

              <div>

                <strong>
                  User activity detected
                </strong>

                <span>
                  10:17 AM
                </span>

              </div>

            </div>

          </div>

        </article>

      </section>

    </div>
  );
};

export default AdminDashboard;