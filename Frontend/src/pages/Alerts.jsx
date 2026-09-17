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
  X,
  RefreshCw,
} from "lucide-react";

import StatCard from "../components/common/StatCard";

import {
  getIncidents,
  API_URL,
} from "../services/api";

import "./Alerts.css";


const Alerts = ({
  role = "basic",
}) => {

  const isAdmin = role === "admin";


  /* =========================================================
     STATE
  ========================================================= */

  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

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
     FORMAT HELPERS
  ========================================================= */

  const formatProbability = (value) => {

    const probability = Number(value);

    if (!Number.isFinite(probability)) {
      return "—";
    }

    return `${(probability * 100).toFixed(1)}%`;
  };


  const formatDetectedTime = (dateValue) => {

    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const diff =
      Date.now() - date.getTime();

    const minutes =
      Math.floor(diff / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days =
      Math.floor(hours / 24);

    return `${days} day${days === 1 ? "" : "s"} ago`;
  };


  const formatLocation = (incident) => {

    if (incident.location) {
      return incident.location;
    }

    if (
      Number.isFinite(Number(incident.latitude)) &&
      Number.isFinite(Number(incident.longitude))
    ) {
      return `${Number(incident.latitude).toFixed(5)}, ${Number(
        incident.longitude
      ).toFixed(5)}`;
    }

    return "India";
  };


  const normalizeRisk = (incident) => {

    const risk =
      String(
        incident.risk_level ||
        incident.risk ||
        ""
      ).toLowerCase();

    if (risk === "high") {
      return "high";
    }

    if (risk === "medium") {
      return "medium";
    }

    if (risk === "low") {
      return "low";
    }

    return "low";
  };


  const normalizeStatus = (incident) => {

    /*
      MongoDB currently does not contain a dedicated
      active / monitoring / resolved field.

      Therefore we derive a display status from
      the current risk level.

      HIGH   -> active
      MEDIUM -> monitoring
      LOW    -> monitoring

      Resolved is only used if the backend eventually
      provides status = resolved.
    */

    const existingStatus =
      String(
        incident.status || ""
      ).toLowerCase();

    if (
      existingStatus === "resolved"
    ) {
      return "resolved";
    }

    if (
      existingStatus === "active"
    ) {
      return "active";
    }

    if (
      existingStatus === "monitoring"
    ) {
      return "monitoring";
    }

    const risk =
      normalizeRisk(incident);

    if (risk === "high") {
      return "active";
    }

    return "monitoring";
  };


  /* =========================================================
     LOAD REAL INCIDENTS FROM MONGODB
  ========================================================= */

  const loadIncidents = async (
    showLoader = false
  ) => {

    try {

      if (showLoader) {
        setLoading(true);
      }

      setError("");

      console.log(
        "🔥 Fetching incidents from MongoDB..."
      );

      const response =
        await getIncidents();

      console.log(
        "🔥 Incidents API response:",
        response
      );

      const records =
        Array.isArray(response?.data)
          ? response.data
          : [];

      const normalizedRecords =
        records.map((record, index) => {

          const risk =
            normalizeRisk(record);

          const status =
            normalizeStatus(record);

          const probability =
            Number(
              record.prediction_probability
            );

          return {

            /*
             * Use backend ID first.
             */
            id:
              record.id ||
              record.observation_key ||
              record._id ||
              `TX-${index + 1}`,

            observation_key:
              record.observation_key ||
              null,

            location:
              formatLocation(record),

            region:
              record.region ||
              "India",

            latitude:
              Number(record.latitude),

            longitude:
              Number(record.longitude),

            risk,

            status,

            confidence:
              formatProbability(
                probability
              ),

            confidenceValue:
              Number.isFinite(probability)
                ? probability
                : null,

            detected:
              formatDetectedTime(
                record.collected_at ||
                record.acq_date
              ),

            collected_at:
              record.collected_at ||
              null,

            predicted_at:
              record.predicted_at ||
              null,

            source:
              record.source_api ||
              "NASA FIRMS",

            satellite:
              record.satellite === "N21"
                ? "VIIRS NOAA-21"
                : record.satellite ||
                  "VIIRS",

            instrument:
              record.instrument ||
              "VIIRS",

            frp:
              record.frp ?? null,

            brightness:
              record.brightness ?? null,

            bright_t31:
              record.bright_t31 ?? null,

            brightness_difference:
              record.brightness_difference ??
              null,

            prediction:
              record.prediction ??
              null,

            prediction_probability:
              Number.isFinite(probability)
                ? probability
                : null,

            prediction_label:
              record.prediction_label ||
              "Processing...",

            risk_level:
              record.risk_level ||
              risk,

            prediction_processed:
              record.prediction_processed ??
              false,

            preprocessed:
              record.preprocessed ??
              false,

            acq_date:
              record.acq_date ||
              null,

            acq_time:
              record.acq_time ||
              null,
          };
        });

      setIncidents(
        normalizedRecords
      );

      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        "❌ Failed to load incidents:",
        err
      );

      setError(
        err.message ||
        "Unable to retrieve incidents from the backend."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     INITIAL LOAD + REAL-TIME REFRESH
  ========================================================= */

  useEffect(() => {

    loadIncidents(true);

    /*
      Refresh every 15 seconds.

      Your FIRMS collector runs every 15 minutes,
      so this keeps the UI checking frequently
      without requiring a page refresh.
    */

    const interval =
      setInterval(() => {
        loadIncidents(false);
      }, 15000);

    return () => {
      clearInterval(interval);
    };

  }, []);


  /* =========================================================
     SUMMARY STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {

    const activeCount =
      incidents.filter(
        (incident) =>
          incident.status === "active"
      ).length;

    const highRiskCount =
      incidents.filter(
        (incident) =>
          incident.risk === "high"
      ).length;

    const monitoringCount =
      incidents.filter(
        (incident) =>
          incident.status === "monitoring"
      ).length;

    const resolvedCount =
      incidents.filter(
        (incident) =>
          incident.status === "resolved"
      ).length;

    return [

      {
        label: "Active Alerts",
        value: String(activeCount),
        change: "",
        description:
          "current high-risk detections",
        icon: Flame,
        variant: "orange",
        changeType: "up",
      },

      {
        label: "High Risk",
        value: String(highRiskCount),
        change: "",
        description:
          "high-risk zones detected",
        icon: ShieldAlert,
        variant: "red",
        changeType: "up",
      },

      {
        label: "Monitoring",
        value: String(monitoringCount),
        change: "",
        description:
          "detections under observation",
        icon: Activity,
        variant: "blue",
        changeType: "up",
      },

      {
        label: "Resolved",
        value: String(resolvedCount),
        change: "",
        description:
          "resolved incidents",
        icon: CheckCircle2,
        variant: "green",
        changeType: "up",
      },

    ];

  }, [incidents]);


  /* =========================================================
     ACTIVE ALERTS
  ========================================================= */

  const alerts = useMemo(() => {

    return incidents
      .filter(
        (incident) =>
          incident.status === "active" ||
          incident.status === "monitoring"
      )
      .sort(
        (a, b) => {

          const dateA =
            new Date(
              a.collected_at || 0
            ).getTime();

          const dateB =
            new Date(
              b.collected_at || 0
            ).getTime();

          return dateB - dateA;
        }
      )
      .slice(0, 6)
      .map((incident) => ({

        id:
          incident.id,

        title:
          incident.prediction_processed
            ? incident.prediction_label ===
              "No Future Fire"
              ? "Thermal Detection"
              : "Potential Future Fire"
            : "Thermal Detection",

        location:
          incident.location,

        region:
          incident.region,

        time:
          incident.detected,

        severity:
          incident.risk,

        status:
          incident.status,

        confidence:
          incident.confidence,

        incident,
      }));

  }, [incidents]);


  /* =========================================================
     FILTER INCIDENTS
  ========================================================= */

  const filteredIncidents = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return incidents.filter(
      (incident) => {

        const matchesSearch =
          !search ||
          String(
            incident.id
          )
            .toLowerCase()
            .includes(search) ||

          String(
            incident.location
          )
            .toLowerCase()
            .includes(search) ||

          String(
            incident.region
          )
            .toLowerCase()
            .includes(search);

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
      }
    );

  }, [
    incidents,
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

    if (severity === "high") {
      return (
        <ShieldAlert size={16} />
      );
    }

    if (severity === "medium") {
      return (
        <AlertTriangle size={16} />
      );
    }

    return (
      <CheckCircle2 size={16} />
    );
  };


  /* =========================================================
     REQUEST EXPORT
  ========================================================= */

  const handleRequestExport = () => {

    setRequestType("export");

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


  const handleRequestSubmit = async (
    event
  ) => {

    event.preventDefault();

    try {

      console.log(
        "📤 Submitting export request:",
        requestForm
      );

      const response =
        await fetch(
          `${API_URL}/api/user-requests`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              name:
                requestForm.name.trim(),

              email:
                requestForm.email.trim(),

              reason:
                requestForm.reason.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Failed to submit export request."
        );
      }

      alert(
        "Export request submitted successfully."
      );

      closeRequestModal();

    } catch (error) {

      console.error(
        "❌ Export request error:",
        error
      );

      alert(
        error.message ||
        "Failed to submit export request. Please try again."
      );
    }
  };


  /* =========================================================
     EXPORT
  ========================================================= */

  const handleExport = () => {

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
            API ERROR
        =================================================== */}

        {error && (

          <div
            style={{
              marginBottom: "15px",
              padding: "12px 15px",
              border:
                "1px solid #e4cccc",
              borderRadius: "6px",
              background:
                "#fff8f8",
              color: "#8f2525",
              fontSize: "12px",
            }}
          >

            Unable to retrieve incidents
            from the backend.

            <br />

            <span
              style={{
                fontSize: "11px",
              }}
            >
              {error}
            </span>

          </div>

        )}


        {/* ===================================================
            LIVE STATUS
        =================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
            fontSize: "10px",
            color: "#708590",
          }}
        >

          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background:
                error
                  ? "#d9534f"
                  : "#43a047",
            }}
          />

          {error
            ? "Backend connection error"
            : "Live MongoDB data"}

          {lastUpdated && (
            <span>
              • Updated{" "}
              {formatDetectedTime(
                lastUpdated
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              loadIncidents(true)
            }
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent:
                "center",
              width: "28px",
              height: "28px",
              border:
                "1px solid #dce5e9",
              borderRadius: "5px",
              background: "#fff",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
            }}
            aria-label="Refresh incidents"
          >

            <RefreshCw
              size={13}
              style={{
                animation:
                  loading
                    ? "spin 1s linear infinite"
                    : "none",
              }}
            />

          </button>

        </div>


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="tx-alerts-stat-grid">

          {statistics.map(
            (stat) => (

              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                description={
                  stat.description
                }
                icon={stat.icon}
                variant={
                  stat.variant
                }
                changeType={
                  stat.changeType
                }
              />

            )
          )}

        </section>


        {/* ===================================================
            ACTIVE ALERTS
        =================================================== */}

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

            {loading &&
            alerts.length === 0 ? (

              <article
                className="tx-active-alert"
              >

                <div className="tx-active-alert-content">

                  <h3>
                    Loading live thermal alerts...
                  </h3>

                  <div className="tx-active-alert-meta">

                    <span>
                      Fetching MongoDB data
                    </span>

                  </div>

                </div>

              </article>

            ) : alerts.length > 0 ? (

              alerts.map(
                (alert) => (

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

                          <Clock3
                            size={12}
                          />

                          {alert.time}

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
                          alert.incident
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

              <article
                className="tx-active-alert"
              >

                <div className="tx-active-alert-content">

                  <h3>
                    No active thermal alerts
                  </h3>

                  <div className="tx-active-alert-meta">

                    <span>
                      No high-risk detections are currently available.
                    </span>

                  </div>

                </div>

              </article>

            )}

          </div>

        </section>


        {/* ===================================================
            ALL INCIDENTS
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

              {filteredIncidents.length}
              {" "}
              incidents

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

                  <th>
                    Incident
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    AI Confidence
                  </th>

                  <th>
                    Detected
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading &&
                filteredIncidents.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="tx-alerts-empty"
                    >

                      Loading thermal incidents...

                    </td>

                  </tr>

                ) : filteredIncidents.length > 0 ? (

                  filteredIncidents.map(
                    (incident) => (

                      <tr
                        key={
                          incident.id
                        }
                      >

                        <td>

                          <span className="tx-incident-id">

                            {String(
                              incident.id
                            ).slice(0, 16)}

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

                      No incidents match the selected filters.

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ===================================================
            FOOTER
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
                  {selectedIncident.id}
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

                  {selectedIncident.risk}
                  {" "}
                  risk

                </span>


                <span
                  className={`tx-status-badge ${selectedIncident.status}`}
                >

                  {selectedIncident.status}

                </span>

              </div>


              <div className="tx-modal-grid">

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {selectedIncident.location}
                  </strong>

                </div>


                <div>

                  <span>
                    Region
                  </span>

                  <strong>
                    {selectedIncident.region}
                  </strong>

                </div>


                <div>

                  <span>
                    AI Confidence
                  </span>

                  <strong>
                    {selectedIncident.confidence}
                  </strong>

                </div>


                <div>

                  <span>
                    Prediction
                  </span>

                  <strong>
                    {selectedIncident.prediction_label}
                  </strong>

                </div>


                <div>

                  <span>
                    FRP
                  </span>

                  <strong>
                    {selectedIncident.frp ?? "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Brightness
                  </span>

                  <strong>
                    {selectedIncident.brightness ?? "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Detected
                  </span>

                  <strong>
                    {selectedIncident.detected}
                  </strong>

                </div>


                <div>

                  <span>
                    Data Source
                  </span>

                  <strong>
                    {selectedIncident.source}
                  </strong>

                </div>


                <div>

                  <span>
                    Satellite
                  </span>

                  <strong>
                    {selectedIncident.satellite}
                  </strong>

                </div>


                <div>

                  <span>
                    Instrument
                  </span>

                  <strong>
                    {selectedIncident.instrument}
                  </strong>

                </div>


                <div>

                  <span>
                    Latitude
                  </span>

                  <strong>
                    {Number.isFinite(
                      selectedIncident.latitude
                    )
                      ? selectedIncident.latitude.toFixed(5)
                      : "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Longitude
                  </span>

                  <strong>
                    {Number.isFinite(
                      selectedIncident.longitude
                    )
                      ? selectedIncident.longitude.toFixed(5)
                      : "—"}
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
                onClick={
                  closeRequestModal
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