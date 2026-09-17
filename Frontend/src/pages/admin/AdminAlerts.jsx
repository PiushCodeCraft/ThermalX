import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Search,
  MapPin,
  Clock3,
  Flame,
  ChevronRight,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getIncidents,
} from "../../services/api";

import "./AdminAlerts.css";


/* =========================================================
   HELPERS
========================================================= */

const normalizeIncident = (incident) => {
  return {
    id:
      incident.id ??
      incident.incidentId ??
      incident.incident_id ??
      incident._id ??
      "Unknown",

    location:
      incident.location ??
      incident.region ??
      incident.place ??
      "Unknown",

    state:
      incident.state ??
      incident.stateName ??
      incident.state_name ??
      "Unknown",

    severity:
      incident.severity ??
      incident.riskLevel ??
      incident.risk_level ??
      "Unknown",

    confidence:
      incident.confidence ??
      incident.confidenceScore ??
      incident.confidence_score ??
      null,

    time:
      incident.time ??
      incident.detectedTime ??
      incident.detected_time ??
      incident.acqTime ??
      incident.acq_time ??
      null,

    date:
      incident.date ??
      incident.detectedDate ??
      incident.detected_date ??
      null,

    source:
      incident.source ??
      incident.satellite ??
      incident.satelliteSource ??
      "Unknown",

    temperature:
      incident.temperature ??
      incident.temperatureK ??
      incident.temperature_k ??
      incident.brightnessTemperature ??
      incident.brightness_temperature ??
      null,

    status:
      incident.status ??
      "Unknown",

    latitude:
      incident.latitude ??
      incident.lat ??
      null,

    longitude:
      incident.longitude ??
      incident.lon ??
      incident.lng ??
      null,

    raw: incident,
  };
};


const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const valueString = String(value);

  // NASA FIRMS format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(valueString)) {
    const [year, month, day] =
      valueString.split("-");

    const date =
      new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

    return date.toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return valueString;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const valueString =
    String(value).trim();

  // NASA FIRMS acq_time:
  // 0530 -> 05:30 AM
  // 0731 -> 07:31 AM
  // 1830 -> 06:30 PM
  if (/^\d{3,4}$/.test(valueString)) {

    const padded =
      valueString.padStart(
        4,
        "0"
      );

    const hours =
      Number(
        padded.slice(0, 2)
      );

    const minutes =
      Number(
        padded.slice(2, 4)
      );

    if (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59
    ) {

      const date =
        new Date();

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return date.toLocaleTimeString(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return valueString;
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


const formatTemperature = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not available";
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return `${value} K`;
  }

  return String(value);
};


const formatConfidence = (value) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text =
    String(value)
      .trim()
      .toLowerCase();


  // NASA FIRMS categorical confidence
  if (text === "h") {
    return 100;
  }

  if (text === "n") {
    return 50;
  }

  if (text === "l") {
    return 25;
  }


  // Numeric confidence
  const number =
    Number(value);

  if (
    Number.isFinite(number)
  ) {
    return Math.round(
      number
    );
  }

  return null;
};


const getSeverityClass = (severity) => {
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

  return "unknown";
};


const getStatusClass = (status) => {
  const value =
    String(status || "")
      .toLowerCase();

  if (
    value.includes("active") ||
    value.includes("open") ||
    value.includes("running")
  ) {
    return "active";
  }

  if (
    value.includes("monitor")
  ) {
    return "monitoring";
  }

  if (
    value.includes("resolved") ||
    value.includes("closed")
  ) {
    return "resolved";
  }

  return "unknown";
};


/* =========================================================
   ADMIN ALERTS
========================================================= */

const AdminAlerts = () => {

  const [incidents, setIncidents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [severity, setSeverity] =
    useState("All");

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD INCIDENTS
  ======================================================= */

  const loadIncidents =
    useCallback(async () => {

      try {

        setRefreshing(true);
        setError("");

        const response =
          await getIncidents();

        /*
         * Supports common backend response formats:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   incidents: [...]
         * }
         *
         * OR
         *
         * {
         *   data: [...]
         * }
         */

        let records = [];

        if (Array.isArray(response)) {
          records = response;
        } else if (
          Array.isArray(response?.incidents)
        ) {
          records = response.incidents;
        } else if (
          Array.isArray(response?.data)
        ) {
          records = response.data;
        } else if (
          Array.isArray(response?.results)
        ) {
          records = response.results;
        }

        setIncidents(
          records.map(normalizeIncident)
        );

      } catch (requestError) {

        console.error(
          "Failed to load incidents:",
          requestError
        );

        setIncidents([]);

        setError(
          "Unable to retrieve incidents from the backend."
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

    loadIncidents();

  }, [loadIncidents]);


  /* =======================================================
     FILTER INCIDENTS
  ======================================================= */

  const filteredIncidents =
    useMemo(() => {

      const query =
        search
          .toLowerCase()
          .trim();

      return incidents.filter(
        (incident) => {

          const matchesSearch =
            !query ||
            String(incident.id)
              .toLowerCase()
              .includes(query) ||
            String(incident.location)
              .toLowerCase()
              .includes(query) ||
            String(incident.state)
              .toLowerCase()
              .includes(query) ||
            String(incident.status)
              .toLowerCase()
              .includes(query);

          const matchesSeverity =
            severity === "All" ||
            String(incident.severity)
              .toLowerCase() ===
              severity.toLowerCase();

          return (
            matchesSearch &&
            matchesSeverity
          );
        }
      );

    }, [
      incidents,
      search,
      severity,
    ]);


  /* =======================================================
     SUMMARY
  ======================================================= */

  const activeCount =
    incidents.filter(
      (incident) =>
        [
          "active",
          "open",
        ].includes(
          String(incident.status)
            .toLowerCase()
        )
    ).length;


  const highSeverityCount =
    incidents.filter(
      (incident) =>
        [
          "high",
          "critical",
        ].includes(
          String(incident.severity)
            .toLowerCase()
        )
    ).length;


  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportIncidents = () => {

    if (
      filteredIncidents.length === 0
    ) {
      return;
    }

    const headers = [
      "Incident ID",
      "Location",
      "State",
      "Severity",
      "Confidence",
      "Time",
      "Date",
      "Source",
      "Temperature",
      "Status",
      "Latitude",
      "Longitude",
    ];

    const rows =
      filteredIncidents.map(
        (incident) => [
          incident.id,
          incident.location,
          incident.state,
          incident.severity,
          incident.confidence !== null
            ? `${incident.confidence}%`
            : "",
          incident.time
            ? formatTime(incident.time)
            : "",
          incident.date
            ? formatDate(incident.date)
            : "",
          incident.source,
          formatTemperature(
            incident.temperature
          ),
          incident.status,
          incident.latitude ?? "",
          incident.longitude ?? "",
        ]
      );

    const escapeCsvValue = (
      value
    ) => {
      return `"${String(value ?? "")
        .replace(/"/g, '""')}"`;
    };

    const csv = [
      headers
        .map(escapeCsvValue)
        .join(","),
      ...rows.map(
        (row) =>
          row
            .map(escapeCsvValue)
            .join(",")
      ),
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "thermal-x-incidents.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="tx-admin-alerts">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="tx-admin-alerts-header">

        <div>

          <span className="tx-admin-alerts-eyebrow">
            THERMAL-X / ADMINISTRATION / INCIDENTS
          </span>

          <h1>
            Alerts & Incidents
          </h1>

          <p>
            Review, filter and monitor detected
            thermal incidents.
          </p>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          <button
            type="button"
            className="tx-admin-alerts-export"
            onClick={loadIncidents}
            disabled={refreshing}
          >

            <RefreshCw
              size={15}
              style={{
                animation: refreshing
                  ? "tx-admin-alert-spin 1s linear infinite"
                  : "none",
              }}
            />

            {refreshing
              ? "REFRESHING..."
              : "REFRESH"}

          </button>


          <button
            type="button"
            className="tx-admin-alerts-export"
            onClick={exportIncidents}
            disabled={
              filteredIncidents.length === 0
            }
          >

            <Download size={15} />

            EXPORT CSV

          </button>

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div
          className="tx-admin-alerts-error"
        >

          <XCircle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="tx-admin-alerts-summary">

        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <AlertTriangle size={18} />
          </div>

          <div>

            <span>
              ACTIVE INCIDENTS
            </span>

            <strong>
              {loading
                ? "—"
                : activeCount}
            </strong>

          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <Flame size={18} />
          </div>

          <div>

            <span>
              HIGH SEVERITY
            </span>

            <strong>
              {loading
                ? "—"
                : highSeverityCount}
            </strong>

          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <Clock3 size={18} />
          </div>

          <div>

            <span>
              LOADED INCIDENTS
            </span>

            <strong>
              {loading
                ? "—"
                : incidents.length}
            </strong>

          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <MapPin size={18} />
          </div>

          <div>

            <span>
              MONITORED REGION
            </span>

            <strong>
              INDIA
            </strong>

          </div>

        </article>

      </section>


      {/* ===================================================
          INCIDENT PANEL
      =================================================== */}

      <section className="tx-admin-alerts-card">

        <div className="tx-admin-alerts-card-header">

          <div>

            <span className="tx-admin-alerts-card-eyebrow">
              INCIDENT DATABASE
            </span>

            <h2>
              Thermal Incidents
            </h2>

          </div>

          <span className="tx-admin-alerts-live">
            LIVE MONITORING
          </span>

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="tx-admin-alerts-filters">

          <div className="tx-admin-alerts-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search incident, location or state..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value
              )
            }
          >

            <option value="All">
              All Severity
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

          </select>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="tx-admin-alerts-empty">

            <RefreshCw
              size={28}
              className="tx-admin-alert-loading-icon"
            />

            <strong>
              Loading incidents
            </strong>

            <span>
              Retrieving current incident data
              from the THERMAL-X backend.
            </span>

          </div>

        )}


        {/* =================================================
            TABLE
        ================================================= */}

        {!loading && (

          <div className="tx-admin-alerts-table-wrapper">

            {filteredIncidents.length > 0 ? (

              <table className="tx-admin-alerts-table">

                <thead>

                  <tr>
                    <th>INCIDENT</th>
                    <th>LOCATION</th>
                    <th>SEVERITY</th>
                    <th>CONFIDENCE</th>
                    <th>TIME</th>
                    {/* <th>STATUS</th> */}
                    <th />
                  </tr>

                </thead>


                <tbody>

                  {filteredIncidents.map(
                    (incident) => {

                      const confidence =
                        formatConfidence(
                          incident.confidence
                        );

                      return (

                        <tr
                          key={
                            incident.id
                          }
                          onClick={() =>
                            setSelectedIncident(
                              incident
                            )
                          }
                        >

                          {/* INCIDENT */}

                          <td>

                            <div className="tx-admin-alert-incident-id">

                              <span>
                                <Flame size={14} />
                              </span>

                              <div>

                                <strong>
                                  {incident.id}
                                </strong>

                                <small>
                                  {incident.source}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* LOCATION */}

                          <td>

                            <div className="tx-admin-alert-location">

                              <strong>
                                {incident.location}
                              </strong>

                              <span>
                                {incident.state}
                              </span>

                            </div>

                          </td>


                          {/* SEVERITY */}

                          <td>

                            <span
                              className={`tx-admin-alert-severity ${getSeverityClass(
                                incident.severity
                              )}`}
                            >
                              {incident.severity}
                            </span>

                          </td>


                          {/* CONFIDENCE */}

                          <td>

                            {confidence !== null ? (

                              <div className="tx-admin-confidence">

                                <div className="tx-admin-confidence-track">

                                  <span
                                    style={{
                                      width: `${confidence}%`,
                                    }}
                                  />

                                </div>

                                <strong>
                                  {confidence}%
                                </strong>

                              </div>

                            ) : (

                              <span>
                                Not available
                              </span>

                            )}

                          </td>


                          {/* TIME */}

                          <td>

                            <div className="tx-admin-alert-time">

                              <strong>
                                {formatTime(
                                  incident.time
                                )}
                              </strong>

                              <span>
                                {formatDate(
                                  incident.date
                                )}
                              </span>

                            </div>

                          </td>


                          {/* STATUS */}

                          {/* <td>

                            <span
                              className={`tx-admin-alert-status ${getStatusClass(
                                incident.status
                              )}`}
                            >
                              {incident.status}
                            </span>

                          </td> */}


                          {/* ARROW */}

                          <td>

                            <ChevronRight
                              size={16}
                              className="tx-admin-alert-arrow"
                            />

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            ) : (

              <div className="tx-admin-alerts-empty">

                <AlertTriangle size={28} />

                <strong>
                  {incidents.length === 0
                    ? "No incidents available"
                    : "No incidents found"}
                </strong>

                <span>

                  {incidents.length === 0
                    ? "The backend returned no incident records."
                    : "Try changing your search or severity filter."}

                </span>

              </div>

            )}

          </div>

        )}

      </section>


      {/* ===================================================
          INCIDENT DETAIL
      =================================================== */}

      {selectedIncident && (

        <div
          className="tx-admin-alert-detail-overlay"
          onClick={() =>
            setSelectedIncident(null)
          }
        >

          <aside
            className="tx-admin-alert-detail"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="tx-admin-alert-detail-header">

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
              >
                ×
              </button>

            </div>


            <div className="tx-admin-alert-detail-status">

              <span
                className={`tx-admin-alert-severity ${getSeverityClass(
                  selectedIncident.severity
                )}`}
              >
                {selectedIncident.severity}
              </span>

              <span
                className={`tx-admin-alert-status ${getStatusClass(
                  selectedIncident.status
                )}`}
              >
                {selectedIncident.status}
              </span>

            </div>


            <div className="tx-admin-alert-detail-grid">

              <div>
                <span>LOCATION</span>

                <strong>
                  {selectedIncident.location}
                </strong>
              </div>


              <div>
                <span>STATE</span>

                <strong>
                  {selectedIncident.state}
                </strong>
              </div>


              <div>
                <span>CONFIDENCE</span>

                <strong>
                  {formatConfidence(
                    selectedIncident.confidence
                  ) !== null
                    ? `${formatConfidence(
                        selectedIncident.confidence
                      )}%`
                    : "Not available"}
                </strong>
              </div>


              <div>
                <span>TEMPERATURE</span>

                <strong>
                  {formatTemperature(
                    selectedIncident.temperature
                  )}
                </strong>
              </div>


              <div>
                <span>DATA SOURCE</span>

                <strong>
                  {selectedIncident.source}
                </strong>
              </div>


              <div>
                <span>DETECTED</span>

                <strong>
                  {formatTime(
                    selectedIncident.time
                  )}
                </strong>
              </div>


              <div>
                <span>DATE</span>

                <strong>
                  {formatDate(
                    selectedIncident.date
                  )}
                </strong>
              </div>


              <div>
                <span>COORDINATES</span>

                <strong>

                  {selectedIncident.latitude !== null &&
                  selectedIncident.longitude !== null
                    ? `${selectedIncident.latitude}, ${selectedIncident.longitude}`
                    : "Not available"}

                </strong>

              </div>

            </div>


            <div className="tx-admin-alert-detail-note">

              <span>
                DATA SOURCE
              </span>

              <p>
                Incident information displayed here
                is retrieved from the THERMAL-X backend.
              </p>

            </div>

          </aside>

        </div>

      )}

    </div>
  );
};

export default AdminAlerts;