import React, { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileDown,
  Flame,
  Search,
  ShieldAlert,
  RefreshCw,
  X,
} from "lucide-react";

import StatCard from "../components/common/StatCard";

import {
  getIncidents,
} from "../services/api";

import "./Alerts.css";

const Alerts = ({
  role = "basic",
}) => {
  const isAdmin = role === "admin";

  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [requestForm, setRequestForm] =
    useState({
      name: "",
      email: "",
      reason: "",
    });

  const [requestSubmitting, setRequestSubmitting] =
    useState(false);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getValue = (
    object,
    keys,
    fallback = "N/A"
  ) => {
    if (!object) return fallback;

    for (const key of keys) {
      if (
        object[key] !== undefined &&
        object[key] !== null &&
        object[key] !== ""
      ) {
        return object[key];
      }
    }

    return fallback;
  };

  const normalizeStatus = (value) => {
    if (
      value === undefined ||
      value === null
    ) {
      return "unknown";
    }

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  };

  const normalizeRisk = (value) => {
    if (
      value === undefined ||
      value === null
    ) {
      return "unknown";
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  const formatConfidence = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "N/A";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      const stringValue = String(value);

      return stringValue.includes("%")
        ? stringValue
        : `${stringValue}%`;
    }

    const percentage =
      numericValue <= 1
        ? numericValue * 100
        : numericValue;

    return `${percentage.toFixed(1)}%`;
  };

  const formatDateTime = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const difference =
      Date.now() - date.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  };

  /* =========================================================
     NORMALIZE BACKEND RESPONSE
  ========================================================= */

  const normalizeIncidents = (
    response
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (
      Array.isArray(response?.incidents)
    ) {
      return response.incidents;
    }

    if (
      Array.isArray(response?.data)
    ) {
      return response.data;
    }

    if (
      Array.isArray(response?.results)
    ) {
      return response.results;
    }

    return [];
  };

  const normalizeIncident = (
    incident
  ) => {
    const detectedAt = getValue(
      incident,
      [
        "detectedAt",
        "detected_at",
        "createdAt",
        "created_at",
        "timestamp",
        "time",
      ],
      null
    );

    return {
      raw: incident,

      id: getValue(
        incident,
        [
          "id",
          "incidentId",
          "incident_id",
          "detectionId",
          "detection_id",
        ]
      ),

      title: getValue(
        incident,
        [
          "title",
          "name",
          "alertTitle",
          "alert_title",
          "classification",
        ],
        "Thermal Detection"
      ),

      location: getValue(
        incident,
        [
          "location",
          "area",
          "place",
          "detectedLocation",
          "detected_location",
        ]
      ),

      region: getValue(
        incident,
        [
          "region",
          "state",
          "stateName",
          "state_name",
        ]
      ),

      risk: normalizeRisk(
        getValue(
          incident,
          [
            "risk",
            "riskLevel",
            "risk_level",
            "severity",
          ],
          "unknown"
        )
      ),

      confidence: formatConfidence(
        getValue(
          incident,
          [
            "confidence",
            "aiConfidence",
            "ai_confidence",
            "modelConfidence",
            "model_confidence",
            "confidenceScore",
            "confidence_score",
          ],
          null
        )
      ),

      detected: formatRelativeTime(
        detectedAt
      ),

      detectedAt,

      status: normalizeStatus(
        getValue(
          incident,
          [
            "status",
            "state",
          ],
          "unknown"
        )
      ),

      source: getValue(
        incident,
        [
          "source",
          "dataSource",
          "data_source",
        ],
        "N/A"
      ),

      satellite: getValue(
        incident,
        [
          "satellite",
          "satelliteName",
          "satellite_name",
        ],
        "N/A"
      ),
    };
  };

  /* =========================================================
     LOAD INCIDENTS
  ========================================================= */

  const loadIncidents = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getIncidents();

      const backendIncidents =
        normalizeIncidents(response);

      setIncidents(
        backendIncidents
      );
    } catch (err) {
      console.error(
        "Incident loading failed:",
        err
      );

      setIncidents([]);

      setError(
        err?.message ||
          "Unable to load thermal incidents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  /* =========================================================
     NORMALIZED INCIDENTS
  ========================================================= */

  const normalizedIncidents =
    useMemo(
      () =>
        incidents.map(
          normalizeIncident
        ),
      [incidents]
    );

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const activeCount =
      normalizedIncidents.filter(
        (incident) =>
          incident.status ===
            "active" ||
          incident.status ===
            "open"
      ).length;

    const highRiskCount =
      normalizedIncidents.filter(
        (incident) =>
          incident.risk === "high" ||
          incident.risk === "critical"
      ).length;

    const monitoringCount =
      normalizedIncidents.filter(
        (incident) =>
          incident.status ===
          "monitoring"
      ).length;

    const resolvedCount =
      normalizedIncidents.filter(
        (incident) =>
          incident.status ===
            "resolved" ||
          incident.status ===
            "closed"
      ).length;

    return [
      {
        label: "Active Alerts",
        value: activeCount,
        description:
          "currently active incidents",
        icon: Flame,
        variant: "orange",
      },
      {
        label: "High Risk",
        value: highRiskCount,
        description:
          "high-risk incidents",
        icon: ShieldAlert,
        variant: "red",
      },
      {
        label: "Monitoring",
        value: monitoringCount,
        description:
          "under observation",
        icon: Activity,
        variant: "blue",
      },
      {
        label: "Resolved",
        value: resolvedCount,
        description:
          "resolved incidents",
        icon: CheckCircle2,
        variant: "green",
      },
    ];
  }, [normalizedIncidents]);

  /* =========================================================
     ACTIVE ALERTS
  ========================================================= */

  const activeAlerts = useMemo(
    () =>
      normalizedIncidents.filter(
        (incident) =>
          incident.status ===
            "active" ||
          incident.status ===
            "open" ||
          incident.status ===
            "monitoring"
      ),
    [normalizedIncidents]
  );

  /* =========================================================
     FILTER INCIDENTS
  ========================================================= */

  const filteredIncidents = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return normalizedIncidents.filter(
      (incident) => {
        const matchesSearch =
          !search ||
          String(incident.id)
            .toLowerCase()
            .includes(search) ||
          String(incident.location)
            .toLowerCase()
            .includes(search) ||
          String(incident.region)
            .toLowerCase()
            .includes(search);

        const matchesRisk =
          riskFilter === "all" ||
          incident.risk ===
            riskFilter;

        const matchesStatus =
          statusFilter === "all" ||
          incident.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesRisk &&
          matchesStatus
        );
      }
    );
  }, [
    normalizedIncidents,
    searchTerm,
    riskFilter,
    statusFilter,
  ]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getSeverityIcon = (
    severity
  ) => {
    if (
      severity === "high" ||
      severity === "critical"
    ) {
      return (
        <ShieldAlert size={16} />
      );
    }

    if (
      severity === "medium"
    ) {
      return (
        <AlertTriangle size={16} />
      );
    }

    return (
      <CheckCircle2 size={16} />
    );
  };

  /* =========================================================
     EXPORT REQUEST
  ========================================================= */

  const openRequestModal = () => {
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    if (requestSubmitting) {
      return;
    }

    setShowRequestModal(false);

    setRequestForm({
      name: "",
      email: "",
      reason: "",
    });
  };

  const handleRequestChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setRequestForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleRequestSubmit =
    async (event) => {
      event.preventDefault();

      const name =
        requestForm.name.trim();

      const email =
        requestForm.email.trim();

      const reason =
        requestForm.reason.trim();

      if (
        !name ||
        !email ||
        !reason
      ) {
        return;
      }

      setRequestSubmitting(true);

      try {
        const API_URL =
          import.meta.env
            .VITE_API_URL ||
          "http://localhost:5000";

        const response =
          await fetch(
            `${API_URL}/api/user-requests`,
            {
              method: "POST",
              headers: {
                Accept:
                  "application/json",
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name,
                email,
                reason,
                type: "export",
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to submit export request."
          );
        }

        alert(
          "Export request submitted successfully."
        );

        closeRequestModal();
      } catch (err) {
        console.error(
          "Export request failed:",
          err
        );

        alert(
          err?.message ||
            "Failed to submit export request."
        );
      } finally {
        setRequestSubmitting(false);
      }
    };

  /* =========================================================
     ADMIN EXPORT
  ========================================================= */

  const handleExport = () => {
    /*
     * The existing API service does not yet
     * contain a report/export endpoint.
     *
     * Until the backend exposes that endpoint,
     * do not generate fake PDF data.
     */
    alert(
      "Report export will be connected when the backend export endpoint is available."
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="tx-alerts-page">

      {/* BACKGROUND */}

      <div className="tx-alerts-background">

        <video
          className="tx-alerts-background-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/earth-space.mp4"
            type="video/mp4"
          />
        </video>

        <div className="tx-alerts-video-overlay" />

      </div>


      {/* CONTENT */}

      <div className="tx-alerts-content">

        {/* HEADER */}

        <section className="tx-alerts-header">

          <div className="tx-alerts-header-left">

            <div className="tx-alerts-breadcrumb">
              THERMAL-X
              <span>/</span>
              Alerts
            </div>

            <h1>
              Thermal Alerts &amp; Incidents
            </h1>

            <p>
              Monitor active thermal alerts and
              review incident history across
              monitored regions of India.
            </p>

          </div>


          <div className="tx-alerts-header-actions">

            {isAdmin ? (
              <button
                type="button"
                className="tx-alerts-export-button"
                onClick={handleExport}
              >
                <Download size={15} />
                Export Report
              </button>
            ) : (
              <button
                type="button"
                className="tx-alerts-request-button"
                onClick={
                  openRequestModal
                }
              >
                <FileDown size={15} />
                Request Export
              </button>
            )}

          </div>

        </section>


        {/* API ERROR */}

        {error && (
          <div className="tx-alerts-api-error">

            <div>
              <strong>
                Unable to load incidents
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={loadIncidents}
              disabled={loading}
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "tx-alerts-refresh-spin"
                    : ""
                }
              />

              Retry
            </button>

          </div>
        )}


        {/* STATISTICS */}

        <section className="tx-alerts-stat-grid">

          {statistics.map(
            (stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={
                  loading
                    ? "..."
                    : stat.value
                }
                description={
                  stat.description
                }
                icon={stat.icon}
                variant={
                  stat.variant
                }
              />
            )
          )}

        </section>


        {/* ACTIVE ALERTS */}

        <section className="tx-alerts-panel">

          <div className="tx-alerts-panel-header">

            <div className="tx-alerts-panel-heading">

              <div className="tx-alerts-panel-icon danger">
                <AlertTriangle
                  size={17}
                />
              </div>

              <div>
                <h2>
                  Active Thermal Alerts
                </h2>

                <span>
                  CURRENT ALERTS REQUIRING ATTENTION
                </span>
              </div>

            </div>


            <div className="tx-alerts-live-indicator">
              <span />
              Live monitoring
            </div>

          </div>


          <div className="tx-active-alert-list">

            {loading ? (

              <div className="tx-alerts-loading">
                <RefreshCw
                  size={22}
                  className="tx-alerts-refresh-spin"
                />

                <span>
                  Loading thermal alerts...
                </span>
              </div>

            ) : activeAlerts.length >
              0 ? (

              activeAlerts.map(
                (alert) => (
                  <article
                    key={alert.id}
                    className="tx-active-alert"
                  >

                    <div
                      className={`tx-active-alert-icon ${alert.risk}`}
                    >
                      {getSeverityIcon(
                        alert.risk
                      )}
                    </div>


                    <div className="tx-active-alert-content">

                      <div className="tx-active-alert-title-row">

                        <h3>
                          {alert.title}
                        </h3>

                        <span
                          className={`tx-alert-severity-badge ${alert.risk}`}
                        >
                          {alert.risk}
                        </span>

                      </div>


                      <div className="tx-active-alert-location">

                        {alert.location}

                        <span>
                          {alert.region}
                        </span>

                      </div>


                      <div className="tx-active-alert-meta">

                        <span>
                          <Clock3
                            size={12}
                          />

                          {alert.detected}
                        </span>

                        <span>
                          AI confidence{" "}
                          {alert.confidence}
                        </span>

                      </div>

                    </div>


                    <button
                      type="button"
                      className="tx-alert-view-button"
                      onClick={() =>
                        setSelectedIncident(
                          alert
                        )
                      }
                    >
                      <Eye size={14} />
                      View
                    </button>

                  </article>
                )
              )

            ) : (

              <div className="tx-alerts-empty-state">

                <AlertTriangle
                  size={30}
                />

                <strong>
                  No active alerts
                </strong>

                <span>
                  No active thermal incidents
                  were returned by the backend.
                </span>

              </div>

            )}

          </div>

        </section>


        {/* INCIDENTS */}

        <section className="tx-alerts-panel tx-incidents-panel">

          <div className="tx-alerts-panel-header">

            <div className="tx-alerts-panel-heading">

              <div className="tx-alerts-panel-icon">
                <Flame size={17} />
              </div>

              <div>
                <h2>
                  All Thermal Incidents
                </h2>

                <span>
                  LATEST DETECTIONS ACROSS INDIA
                </span>
              </div>

            </div>


            <div className="tx-incident-count">

              {loading
                ? "..."
                : `${filteredIncidents.length} incidents`}

            </div>

          </div>


          {/* FILTERS */}

          <div className="tx-alerts-filters">

            <div className="tx-alerts-search">

              <Search size={15} />

              <input
                type="text"
                placeholder="Search incident, location or region..."
                value={searchTerm}
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target
                      .value
                  )
                }
              />

            </div>


            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(
                  event.target.value
                )
              }
              aria-label="Filter by risk"
            >
              <option value="all">
                All Risk Levels
              </option>

              <option value="high">
                High Risk
              </option>

              <option value="medium">
                Medium Risk
              </option>

              <option value="low">
                Low Risk
              </option>

              <option value="critical">
                Critical
              </option>

            </select>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Filter by status"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="open">
                Open
              </option>

              <option value="monitoring">
                Monitoring
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>

            </select>

          </div>


          {/* TABLE */}

          <div className="tx-alerts-table-wrapper">

            <table className="tx-alerts-table">

              <thead>

                <tr>
                  <th>Incident</th>
                  <th>Location</th>
                  <th>Risk</th>
                  <th>AI Confidence</th>
                  <th>Detected</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="tx-alerts-empty"
                    >
                      <RefreshCw
                        size={20}
                        className="tx-alerts-refresh-spin"
                      />

                      <span>
                        Loading incidents...
                      </span>
                    </td>
                  </tr>

                ) : filteredIncidents.length >
                  0 ? (

                  filteredIncidents.map(
                    (incident) => (
                      <tr
                        key={
                          incident.id
                        }
                      >

                        <td>
                          <span className="tx-incident-id">
                            {
                              incident.id
                            }
                          </span>
                        </td>


                        <td>

                          <div className="tx-incident-location">

                            <strong>
                              {
                                incident.location
                              }
                            </strong>

                            <span>
                              {
                                incident.region
                              }
                            </span>

                          </div>

                        </td>


                        <td>

                          <span
                            className={`tx-risk-badge ${incident.risk}`}
                          >
                            {
                              incident.risk
                            }
                          </span>

                        </td>


                        <td>

                          <span className="tx-confidence">
                            {
                              incident.confidence
                            }
                          </span>

                        </td>


                        <td>

                          <span className="tx-detected">
                            {
                              incident.detected
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={`tx-status-badge ${incident.status}`}
                          >
                            {
                              incident.status
                            }
                          </span>

                        </td>


                        <td>

                          <button
                            type="button"
                            className="tx-incident-view"
                            onClick={() =>
                              setSelectedIncident(
                                incident
                              )
                            }
                          >
                            <Eye
                              size={13}
                            />
                            Details
                          </button>

                        </td>

                      </tr>
                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="tx-alerts-empty"
                    >

                      <AlertTriangle
                        size={22}
                      />

                      <strong>
                        No incidents found
                      </strong>

                      <span>
                        No backend records match
                        the selected filters.
                      </span>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* FOOTER */}

        <section className="tx-alerts-footer">

          <div>

            <strong>
              NASA FIRMS
            </strong>

            <span>
              Fire Information for Resource
              Management System
            </span>

          </div>


          <div>
            Thermal detections are based on
            satellite observations.
          </div>

        </section>

      </div>


      {/* =====================================================
          INCIDENT DETAILS MODAL
      ===================================================== */}

      {selectedIncident && (

        <div
          className="tx-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedIncident(
                null
              );
            }

          }}
        >

          <div className="tx-modal">

            <div className="tx-modal-header">

              <div>

                <span>
                  INCIDENT DETAILS
                </span>

                <h2>
                  {
                    selectedIncident.id
                  }
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(
                    null
                  )
                }
                aria-label="Close incident details"
              >
                <X size={18} />
              </button>

            </div>


            <div className="tx-modal-body">

              <div className="tx-modal-status-row">

                <span
                  className={`tx-risk-badge ${selectedIncident.risk}`}
                >
                  {
                    selectedIncident.risk
                  }{" "}
                  risk
                </span>

                <span
                  className={`tx-status-badge ${selectedIncident.status}`}
                >
                  {
                    selectedIncident.status
                  }
                </span>

              </div>


              <div className="tx-modal-grid">

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {
                      selectedIncident.location
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Region
                  </span>

                  <strong>
                    {
                      selectedIncident.region
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    AI Confidence
                  </span>

                  <strong>
                    {
                      selectedIncident.confidence
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Detected
                  </span>

                  <strong>
                    {
                      selectedIncident.detectedAt
                        ? formatDateTime(
                            selectedIncident.detectedAt
                          )
                        : selectedIncident.detected
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Data Source
                  </span>

                  <strong>
                    {
                      selectedIncident.source
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Satellite
                  </span>

                  <strong>
                    {
                      selectedIncident.satellite
                    }
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          REQUEST EXPORT MODAL
      ===================================================== */}

      {showRequestModal && (

        <div
          className="tx-modal-backdrop"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeRequestModal();
            }

          }}
        >

          <div className="tx-modal tx-request-modal">

            <div className="tx-modal-header">

              <div>

                <span>
                  REQUEST ACCESS
                </span>

                <h2>
                  Request Incident Export
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  closeRequestModal
                }
                disabled={
                  requestSubmitting
                }
                aria-label="Close request form"
              >
                <X size={18} />
              </button>

            </div>


            <form
              className="tx-request-form"
              onSubmit={
                handleRequestSubmit
              }
            >

              <label>
                Name

                <input
                  type="text"
                  name="name"
                  value={
                    requestForm.name
                  }
                  onChange={
                    handleRequestChange
                  }
                  placeholder="Enter your name"
                  required
                />
              </label>


              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={
                    requestForm.email
                  }
                  onChange={
                    handleRequestChange
                  }
                  placeholder="Enter your email"
                  required
                />
              </label>


              <label>
                Reason

                <textarea
                  name="reason"
                  value={
                    requestForm.reason
                  }
                  onChange={
                    handleRequestChange
                  }
                  placeholder="Explain why you need access..."
                  rows="4"
                  required
                />
              </label>


              <div className="tx-request-form-actions">

                <button
                  type="button"
                  className="tx-request-cancel"
                  onClick={
                    closeRequestModal
                  }
                  disabled={
                    requestSubmitting
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="tx-request-submit"
                  disabled={
                    requestSubmitting
                  }
                >

                  {requestSubmitting ? (
                    <>
                      <RefreshCw
                        size={14}
                        className="tx-alerts-refresh-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
};

export default Alerts;