import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  FileText,
  Map,
  Users,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getDashboard,
} from "../../services/api";

import IndiaFocusedMap from "../../components/map/IndiaFocusedMap";

import "./AdminDashboard.css";


/* =========================================================
   HELPERS
========================================================= */

const getArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};


const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString();
};


const getValue = (
  object,
  keys,
  fallback = null
) => {
  if (!object) {
    return fallback;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return fallback;
};


const formatTime = (value) => {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const getSeverityClass = (
  severity
) => {
  const value =
    String(severity || "")
      .toLowerCase();

  if (
    value.includes("high") ||
    value.includes("critical")
  ) {
    return "high";
  }

  if (
    value.includes("medium") ||
    value.includes("moderate")
  ) {
    return "medium";
  }

  if (
    value.includes("low")
  ) {
    return "low";
  }

  return "";
};


/* =========================================================
   COMPONENT
========================================================= */

const AdminDashboard = () => {

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard =
    useCallback(async () => {

      try {

        setRefreshing(true);
        setError("");

        const response =
          await getDashboard();

        setDashboard(
          response?.data ??
          response
        );

      } catch (requestError) {

        console.error(
          "Failed to load dashboard:",
          requestError
        );

        setDashboard(null);

        setError(
          "Unable to retrieve dashboard data from the backend."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    }, []);


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {

    loadDashboard();

  }, [loadDashboard]);


  /* =======================================================
     READ BACKEND DATA
  ======================================================= */

  const statistics =
    dashboard?.statistics ??
    dashboard?.stats ??
    {};


  const recentIncidents =
    getArray(
      dashboard?.recentIncidents ??
      dashboard?.recent_incidents ??
      dashboard?.incidents
    );


  const activities =
    getArray(
      dashboard?.recentActivity ??
      dashboard?.recentActivities ??
      dashboard?.activities ??
      dashboard?.adminActivity
    );


  const systemStatus =
    dashboard?.systemStatus ??
    dashboard?.system_status ??
    {};


  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = [
    {
      title: "Active Incidents",

      value: getValue(
        statistics,
        [
          "activeIncidents",
          "active_incidents",
        ]
      ),

      detail:
        "Currently detected",

      icon: AlertTriangle,
    },

    {
      title: "Thermal Detections",

      value: getValue(
        statistics,
        [
          "thermalDetections",
          "thermal_detections",
          "detections",
        ]
      ),

      detail:
        "Last 24 hours",

      icon: Activity,
    },

    {
      title: "AI Analyses",

      value: getValue(
        statistics,
        [
          "aiAnalyses",
          "ai_analyses",
          "analyses",
        ]
      ),

      detail:
        "Completed today",

      icon: BrainCircuit,
    },

    {
      title: "Registered Users",

      value: getValue(
        statistics,
        [
          "registeredUsers",
          "registered_users",
          "users",
          "totalUsers",
          "total_users",
        ]
      ),

      detail:
        "Total users",

      icon: Users,
    },
  ];


  /* =======================================================
     SYSTEM STATUS
  ======================================================= */

  const systemItems = [
    {
      label: "NASA FIRMS Data",

      value:
        getValue(
          systemStatus,
          [
            "nasaFirms",
            "nasa_firms",
            "firms",
          ]
        ),
    },

    {
      label: "AI Detection Model",

      value:
        getValue(
          systemStatus,
          [
            "aiDetection",
            "ai_detection",
            "ai",
          ]
        ),
    },

    {
      label: "Thermal Data Collector",

      value:
        getValue(
          systemStatus,
          [
            "thermalCollector",
            "thermal_collector",
            "collector",
          ]
        ),
    },

    {
      label: "Alert Processing",

      value:
        getValue(
          systemStatus,
          [
            "alertProcessing",
            "alert_processing",
            "alerts",
          ]
        ),
    },

    {
      label: "Database",

      value:
        getValue(
          systemStatus,
          [
            "database",
            "db",
        ]
        ),
    },
  ];


  /* =======================================================
     SYSTEM OPERATIONAL STATUS
  ======================================================= */

  const systemOperational =
    getValue(
      systemStatus,
      [
        "operational",
        "isOperational",
        "is_operational",
      ]
    );


  /* =======================================================
     VIEW MAP
  ======================================================= */

  const handleViewMap = () => {
    window.location.href =
      "/admin/live-map";
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="tx-admin-dashboard">

      {/* ===================================================
          HEADER
      =================================================== */}

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

          <span
            className="tx-admin-status-dot"
          />

          {loading
            ? "CHECKING SYSTEM"
            : systemOperational === false
              ? "SYSTEM ATTENTION REQUIRED"
              : "SYSTEM STATUS AVAILABLE"}

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div
          className="tx-admin-dashboard-error"
        >

          <XCircle size={18} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadDashboard}
          >
            RETRY
          </button>

        </div>

      )}


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="tx-admin-statistics">

        {stats.map((stat) => {

          const Icon =
            stat.icon;

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

                  {loading
                    ? "—"
                    : formatNumber(
                        stat.value
                      )}

                </strong>


                <span className="tx-admin-stat-detail">

                  {stat.detail}

                </span>

              </div>

            </article>

          );

        })}

      </section>


      {/* ===================================================
          MAP + SYSTEM STATUS
      =================================================== */}

      <section className="tx-admin-dashboard-grid">


        {/* =================================================
            REAL NASA FIRMS MAP
        ================================================= */}

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


        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

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


            <button
              type="button"
              className="tx-admin-system-refresh"
              onClick={loadDashboard}
              disabled={refreshing}
              title="Refresh dashboard"
            >

              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "tx-admin-refresh-spin"
                    : ""
                }
              />

            </button>

          </div>


          <div className="tx-admin-system-list">

            {systemItems.map(
              (item) => (

                <div
                  className="tx-admin-system-row"
                  key={item.label}
                >

                  <span>
                    {item.label}
                  </span>


                  <strong>

                    {loading
                      ? "CHECKING..."
                      : item.value !== null &&
                        item.value !== undefined
                        ? String(
                            item.value
                          ).toUpperCase()
                        : "NOT AVAILABLE"}

                  </strong>

                </div>

              )
            )}

          </div>

        </article>

      </section>


      {/* ===================================================
          LOWER DASHBOARD
      =================================================== */}

      <section className="tx-admin-lower-grid">


        {/* =================================================
            RECENT INCIDENTS
        ================================================= */}

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

              {loading
                ? "LOADING"
                : "LIVE"}

            </span>

          </div>


          <div className="tx-admin-incident-list">

            {loading ? (

              <div className="tx-admin-dashboard-empty">

                <RefreshCw
                  size={22}
                  className="tx-admin-refresh-spin"
                />

                <span>
                  Loading incident data...
                </span>

              </div>

            ) : recentIncidents.length > 0 ? (

              recentIncidents
                .slice(0, 5)
                .map(
                  (incident, index) => {

                    const id =
                      getValue(
                        incident,
                        [
                          "id",
                          "incidentId",
                          "incident_id",
                          "_id",
                        ],
                        `Incident ${index + 1}`
                      );

                    const title =
                      getValue(
                        incident,
                        [
                          "title",
                          "event",
                          "description",
                          "type",
                        ],
                        "Thermal event detected"
                      );

                    const location =
                      getValue(
                        incident,
                        [
                          "location",
                          "region",
                          "place",
                        ],
                        "Location unavailable"
                      );

                    const severity =
                      getValue(
                        incident,
                        [
                          "severity",
                          "riskLevel",
                          "risk_level",
                        ],
                        "Unknown"
                      );

                    const timestamp =
                      getValue(
                        incident,
                        [
                          "timestamp",
                          "detectedAt",
                          "detected_at",
                          "time",
                        ]
                      );

                    return (

                      <div
                        className="tx-admin-incident-row"
                        key={id}
                      >

                        <span className="tx-admin-incident-time">

                          {formatTime(
                            timestamp
                          )}

                        </span>


                        <div>

                          <strong>
                            {title}
                          </strong>

                          <span>
                            {location}
                          </span>

                        </div>


                        <b
                          className={getSeverityClass(
                            severity
                          )}
                        >

                          {String(
                            severity
                          ).toUpperCase()}

                        </b>

                      </div>

                    );

                  }
                )

            ) : (

              <div className="tx-admin-dashboard-empty">

                <AlertTriangle
                  size={24}
                />

                <strong>
                  No recent incidents
                </strong>

                <span>
                  No incident records were returned
                  by the backend.
                </span>

              </div>

            )}

          </div>

        </article>


        {/* =================================================
            ADMIN ACTIVITY
        ================================================= */}

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

            {loading ? (

              <div className="tx-admin-dashboard-empty">

                <RefreshCw
                  size={22}
                  className="tx-admin-refresh-spin"
                />

                <span>
                  Loading activity...
                </span>

              </div>

            ) : activities.length > 0 ? (

              activities
                .slice(0, 5)
                .map(
                  (activity, index) => {

                    const type =
                      String(
                        getValue(
                          activity,
                          [
                            "type",
                            "category",
                            "action",
                          ],
                          ""
                        )
                      ).toLowerCase();


                    let Icon =
                      Activity;

                    if (
                      type.includes("ai") ||
                      type.includes("analysis")
                    ) {
                      Icon =
                        BrainCircuit;
                    } else if (
                      type.includes("report")
                    ) {
                      Icon =
                        FileText;
                    } else if (
                      type.includes("user")
                    ) {
                      Icon =
                        Users;
                    }


                    const title =
                      getValue(
                        activity,
                        [
                          "title",
                          "message",
                          "action",
                          "description",
                        ],
                        "System activity"
                      );


                    const timestamp =
                      getValue(
                        activity,
                        [
                          "timestamp",
                          "createdAt",
                          "created_at",
                          "time",
                        ]
                      );


                    return (

                      <div
                        className="tx-admin-activity-row"
                        key={
                          activity.id ??
                          activity._id ??
                          index
                        }
                      >

                        <Icon
                          size={17}
                        />


                        <div>

                          <strong>
                            {title}
                          </strong>

                          <span>

                            {timestamp
                              ? formatTime(
                                  timestamp
                                )
                              : "Time unavailable"}

                          </span>

                        </div>

                      </div>

                    );

                  }
                )

            ) : (

              <div className="tx-admin-dashboard-empty">

                <Activity
                  size={24}
                />

                <strong>
                  No recent activity
                </strong>

                <span>
                  No activity records were returned
                  by the backend.
                </span>

              </div>

            )}

          </div>

        </article>

      </section>

    </div>
  );
};

export default AdminDashboard;