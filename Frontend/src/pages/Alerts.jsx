import React, { useMemo, useState } from "react";

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
  X,
} from "lucide-react";

import StatCard from "../components/common/StatCard";

import "./Alerts.css";

const Alerts = ({
  role = "basic",
}) => {
  const isAdmin = role === "admin";

  /* =========================================================
     SUMMARY STATISTICS
  ========================================================= */

  const statistics = [
    {
      label: "Active Alerts",
      value: "24",
      change: "+12.5%",
      description: "vs previous period",
      icon: Flame,
      variant: "orange",
      changeType: "up",
    },
    {
      label: "High Risk",
      value: "08",
      change: "+4.2%",
      description: "risk zones detected",
      icon: ShieldAlert,
      variant: "red",
      changeType: "up",
    },
    {
      label: "Monitoring",
      value: "11",
      change: "+3",
      description: "under observation",
      icon: Activity,
      variant: "blue",
      changeType: "up",
    },
    {
      label: "Resolved",
      value: "05",
      change: "+2",
      description: "recently resolved",
      icon: CheckCircle2,
      variant: "green",
      changeType: "up",
    },
  ];

  /* =========================================================
     ACTIVE ALERTS
  ========================================================= */

  const alerts = [
    {
      id: "ALT-2048",
      title: "High Thermal Activity",
      location: "Odisha Forest Region",
      region: "Odisha",
      time: "12 minutes ago",
      severity: "high",
      status: "active",
      confidence: "96%",
    },
    {
      id: "ALT-2047",
      title: "Potential Fire Cluster",
      location: "Chhattisgarh Sector 04",
      region: "Chhattisgarh",
      time: "28 minutes ago",
      severity: "high",
      status: "active",
      confidence: "93%",
    },
    {
      id: "ALT-2046",
      title: "Thermal Anomaly Detected",
      location: "Jharkhand Reserve",
      region: "Jharkhand",
      time: "46 minutes ago",
      severity: "medium",
      status: "monitoring",
      confidence: "87%",
    },
    {
      id: "ALT-2045",
      title: "Elevated Thermal Signal",
      location: "West Bengal Region",
      region: "West Bengal",
      time: "58 minutes ago",
      severity: "medium",
      status: "monitoring",
      confidence: "84%",
    },
  ];

  /* =========================================================
     INCIDENTS
  ========================================================= */

  const incidents = [
    {
      id: "TX-1048",
      location: "Odisha Forest",
      region: "Odisha",
      risk: "high",
      confidence: "96%",
      detected: "12 min ago",
      status: "active",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
    {
      id: "TX-1047",
      location: "Chhattisgarh Sector 04",
      region: "Chhattisgarh",
      risk: "high",
      confidence: "93%",
      detected: "28 min ago",
      status: "active",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
    {
      id: "TX-1046",
      location: "Jharkhand Reserve",
      region: "Jharkhand",
      risk: "medium",
      confidence: "87%",
      detected: "46 min ago",
      status: "monitoring",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
    {
      id: "TX-1045",
      location: "West Bengal Region",
      region: "West Bengal",
      risk: "low",
      confidence: "91%",
      detected: "1 hour ago",
      status: "resolved",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
    {
      id: "TX-1044",
      location: "Madhya Pradesh Forest",
      region: "Madhya Pradesh",
      risk: "medium",
      confidence: "89%",
      detected: "2 hours ago",
      status: "monitoring",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
    {
      id: "TX-1043",
      location: "Assam Forest Belt",
      region: "Assam",
      risk: "low",
      confidence: "88%",
      detected: "3 hours ago",
      status: "resolved",
      source: "NASA FIRMS",
      satellite: "VIIRS NOAA-21",
    },
  ];

  /* =========================================================
     STATE
  ========================================================= */

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [requestType, setRequestType] =
    useState("export");

  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    reason: "",
  });

  /* =========================================================
     FILTER INCIDENTS
  ========================================================= */

  const filteredIncidents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !search ||
        incident.id.toLowerCase().includes(search) ||
        incident.location.toLowerCase().includes(search) ||
        incident.region.toLowerCase().includes(search);

      const matchesRisk =
        riskFilter === "all" ||
        incident.risk === riskFilter;

      const matchesStatus =
        statusFilter === "all" ||
        incident.status === statusFilter;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus
      );
    });
  }, [
    searchTerm,
    riskFilter,
    statusFilter,
  ]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getSeverityIcon = (severity) => {
    if (severity === "high") {
      return <ShieldAlert size={16} />;
    }

    if (severity === "medium") {
      return <AlertTriangle size={16} />;
    }

    return <CheckCircle2 size={16} />;
  };

const handleRequestExport = () => {
    setRequestType("export");
    setShowRequestModal(true);
  };

  const openRequestModal = (type) => {
    setRequestType(type);
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);

    setRequestForm({
      name: "",
      email: "",
      reason: "",
    });
  };

  const handleRequestChange = (event) => {
    const { name, value } = event.target;

    setRequestForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("📤 Submitting export request:", requestForm);

      const response = await fetch(
        "http://localhost:5000/api/user-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: requestForm.name.trim(),
            email: requestForm.email.trim(),
            reason: requestForm.reason.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log("📤 Export request response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit export request."
        );
      }

      alert("Export request submitted successfully.");
      closeRequestModal();
    } catch (error) {
      console.error("❌ Export request error:", error);

      alert(
        error.message ||
          "Failed to submit export request. Please try again."
      );
    }
  };

  const handleExport = () => {
    /*
      Temporary frontend export behaviour.

      Later this should call the backend
      report/export API and generate the
      actual PDF.
    */

    window.print();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="tx-alerts-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

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

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="tx-alerts-content">

        {/* ===================================================
            HEADER
        =================================================== */}

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
              Monitor active thermal alerts and review
              incident history across monitored regions
              of India.
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
                onClick={handleRequestExport}
              >
                <FileDown size={15} />
                Request Export
              </button>
            )}

          </div>

        </section>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="tx-alerts-stat-grid">

          {statistics.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              description={stat.description}
              icon={stat.icon}
              variant={stat.variant}
              changeType={stat.changeType}
            />
          ))}

        </section>

        {/* ===================================================
            ACTIVE ALERTS
        =================================================== */}

        <section className="tx-alerts-panel">

          <div className="tx-alerts-panel-header">

            <div className="tx-alerts-panel-heading">

              <div className="tx-alerts-panel-icon danger">
                <AlertTriangle size={17} />
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

            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="tx-active-alert"
              >

                <div
                  className={`tx-active-alert-icon ${alert.severity}`}
                >
                  {getSeverityIcon(
                    alert.severity
                  )}
                </div>

                <div className="tx-active-alert-content">

                  <div className="tx-active-alert-title-row">

                    <h3>
                      {alert.title}
                    </h3>

                    <span
                      className={`tx-alert-severity-badge ${alert.severity}`}
                    >
                      {alert.severity}
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
                      <Clock3 size={12} />
                      {alert.time}
                    </span>

                    <span>
                      AI confidence {alert.confidence}
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className="tx-alert-view-button"
                  onClick={() => {
                    const incident =
                      incidents.find(
                        (item) =>
                          item.id ===
                          alert.id.replace(
                            "ALT",
                            "TX"
                          )
                      );

                    setSelectedIncident(
                      incident || {
                        id: alert.id,
                        location: alert.location,
                        region: alert.region,
                        risk: alert.severity,
                        confidence: alert.confidence,
                        detected: alert.time,
                        status: alert.status,
                        source: "NASA FIRMS",
                        satellite: "VIIRS NOAA-21",
                      }
                    );
                  }}
                >
                  <Eye size={14} />
                  View
                </button>

              </article>
            ))}

          </div>

        </section>

        {/* ===================================================
            INCIDENTS
        =================================================== */}

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
              {filteredIncidents.length} incidents
            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="tx-alerts-filters">

            <div className="tx-alerts-search">

              <Search size={15} />

              <input
                type="text"
                placeholder="Search incident, location or region..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
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

              <option value="monitoring">
                Monitoring
              </option>

              <option value="resolved">
                Resolved
              </option>
            </select>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

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

                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map(
                    (incident) => (
                      <tr key={incident.id}>

                        <td>
                          <span className="tx-incident-id">
                            {incident.id}
                          </span>
                        </td>

                        <td>
                          <div className="tx-incident-location">
                            <strong>
                              {incident.location}
                            </strong>

                            <span>
                              {incident.region}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`tx-risk-badge ${incident.risk}`}
                          >
                            {incident.risk}
                          </span>
                        </td>

                        <td>
                          <span className="tx-confidence">
                            {incident.confidence}
                          </span>
                        </td>

                        <td>
                          <span className="tx-detected">
                            {incident.detected}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`tx-status-badge ${incident.status}`}
                          >
                            {incident.status}
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
                            <Eye size={13} />
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
                      No incidents match the selected
                      filters.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ===================================================
            FOOTER INFORMATION
        =================================================== */}

        <section className="tx-alerts-footer">

          <div>
            <strong>
              NASA FIRMS
            </strong>

            <span>
              Fire Information for Resource Management System
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
              setSelectedIncident(null);
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
                  {selectedIncident.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(null)
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
                  {selectedIncident.risk} risk
                </span>

                <span
                  className={`tx-status-badge ${selectedIncident.status}`}
                >
                  {selectedIncident.status}
                </span>

              </div>

              <div className="tx-modal-grid">

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedIncident.location}
                  </strong>
                </div>

                <div>
                  <span>Region</span>
                  <strong>
                    {selectedIncident.region}
                  </strong>
                </div>

                <div>
                  <span>AI Confidence</span>
                  <strong>
                    {selectedIncident.confidence}
                  </strong>
                </div>

                <div>
                  <span>Detected</span>
                  <strong>
                    {selectedIncident.detected}
                  </strong>
                </div>

                <div>
                  <span>Data Source</span>
                  <strong>
                    {selectedIncident.source}
                  </strong>
                </div>

                <div>
                  <span>Satellite</span>
                  <strong>
                    {selectedIncident.satellite}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          REQUEST MODAL
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
                  {requestType === "export"
                    ? "Request Incident Export"
                    : "Request Data"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeRequestModal}
                aria-label="Close request form"
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="tx-request-form"
              onSubmit={handleRequestSubmit}
            >

              <label>
                Name

                <input
                  type="text"
                  name="name"
                  value={requestForm.name}
                  onChange={handleRequestChange}
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  name="email"
                  value={requestForm.email}
                  onChange={handleRequestChange}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Reason

                <textarea
                  name="reason"
                  value={requestForm.reason}
                  onChange={handleRequestChange}
                  placeholder="Explain why you need access..."
                  rows="4"
                  required
                />
              </label>

              <div className="tx-request-form-actions">

                <button
                  type="button"
                  className="tx-request-cancel"
                  onClick={closeRequestModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="tx-request-submit"
                >
                  Submit Request
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