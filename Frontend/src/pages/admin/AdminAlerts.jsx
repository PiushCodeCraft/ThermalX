import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Search,
  MapPin,
  Clock3,
  Flame,
  ChevronRight,
  Download,
} from "lucide-react";

import "./AdminAlerts.css";

const AdminAlerts = () => {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [selectedIncident, setSelectedIncident] = useState(null);

  const incidents = [
    {
      id: "INC-001",
      location: "Northern India",
      state: "Haryana",
      severity: "High",
      confidence: 94,
      time: "10:42 AM",
      date: "16 Sep 2026",
      source: "VIIRS NOAA-21",
      temperature: "327 K",
      status: "Active",
    },
    {
      id: "INC-002",
      location: "Central India",
      state: "Madhya Pradesh",
      severity: "Medium",
      confidence: 87,
      time: "10:36 AM",
      date: "16 Sep 2026",
      source: "VIIRS NOAA-21",
      temperature: "312 K",
      status: "Active",
    },
    {
      id: "INC-003",
      location: "Eastern India",
      state: "Odisha",
      severity: "Low",
      confidence: 76,
      time: "10:21 AM",
      date: "16 Sep 2026",
      source: "VIIRS NOAA-21",
      temperature: "304 K",
      status: "Monitoring",
    },
    {
      id: "INC-004",
      location: "Southern India",
      state: "Karnataka",
      severity: "High",
      confidence: 91,
      time: "09:58 AM",
      date: "16 Sep 2026",
      source: "VIIRS NOAA-21",
      temperature: "321 K",
      status: "Active",
    },
    {
      id: "INC-005",
      location: "Western India",
      state: "Maharashtra",
      severity: "Medium",
      confidence: 83,
      time: "09:41 AM",
      date: "16 Sep 2026",
      source: "VIIRS NOAA-21",
      temperature: "309 K",
      status: "Monitoring",
    },
  ];

  const filteredIncidents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.id.toLowerCase().includes(query) ||
        incident.location.toLowerCase().includes(query) ||
        incident.state.toLowerCase().includes(query) ||
        incident.status.toLowerCase().includes(query);

      const matchesSeverity =
        severity === "All" ||
        incident.severity === severity;

      return matchesSearch && matchesSeverity;
    });
  }, [search, severity]);

  const exportIncidents = () => {
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
    ];

    const rows = filteredIncidents.map((incident) => [
      incident.id,
      incident.location,
      incident.state,
      incident.severity,
      `${incident.confidence}%`,
      incident.time,
      incident.date,
      incident.source,
      incident.temperature,
      incident.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${value}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "thermal-x-incidents.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="tx-admin-alerts">

      {/* HEADER */}

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

        <button
          type="button"
          className="tx-admin-alerts-export"
          onClick={exportIncidents}
        >
          <Download size={15} />
          EXPORT CSV
        </button>

      </header>


      {/* SUMMARY */}

      <section className="tx-admin-alerts-summary">

        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <AlertTriangle size={18} />
          </div>

          <div>
            <span>ACTIVE INCIDENTS</span>
            <strong>
              {
                incidents.filter(
                  (item) => item.status === "Active"
                ).length
              }
            </strong>
          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <Flame size={18} />
          </div>

          <div>
            <span>HIGH SEVERITY</span>
            <strong>
              {
                incidents.filter(
                  (item) => item.severity === "High"
                ).length
              }
            </strong>
          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>LAST 24 HOURS</span>
            <strong>
              {incidents.length}
            </strong>
          </div>

        </article>


        <article className="tx-admin-alert-summary-card">

          <div className="tx-admin-alert-summary-icon">
            <MapPin size={18} />
          </div>

          <div>
            <span>MONITORED REGION</span>
            <strong>INDIA</strong>
          </div>

        </article>

      </section>


      {/* INCIDENT PANEL */}

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


        {/* FILTERS */}

        <div className="tx-admin-alerts-filters">

          <div className="tx-admin-alerts-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search incident, location or state..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value)
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


        {/* INCIDENT TABLE */}

        <div className="tx-admin-alerts-table-wrapper">

          <table className="tx-admin-alerts-table">

            <thead>
              <tr>
                <th>INCIDENT</th>
                <th>LOCATION</th>
                <th>SEVERITY</th>
                <th>CONFIDENCE</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>

            <tbody>

              {filteredIncidents.map((incident) => (

                <tr
                  key={incident.id}
                  onClick={() =>
                    setSelectedIncident(incident)
                  }
                >

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


                  <td>

                    <span
                      className={`tx-admin-alert-severity ${incident.severity.toLowerCase()}`}
                    >
                      {incident.severity}
                    </span>

                  </td>


                  <td>

                    <div className="tx-admin-confidence">

                      <div className="tx-admin-confidence-track">

                        <span
                          style={{
                            width: `${incident.confidence}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {incident.confidence}%
                      </strong>

                    </div>

                  </td>


                  <td>

                    <div className="tx-admin-alert-time">

                      <strong>
                        {incident.time}
                      </strong>

                      <span>
                        {incident.date}
                      </span>

                    </div>

                  </td>


                  <td>

                    <span
                      className={`tx-admin-alert-status ${incident.status.toLowerCase()}`}
                    >
                      {incident.status}
                    </span>

                  </td>


                  <td>

                    <ChevronRight
                      size={16}
                      className="tx-admin-alert-arrow"
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {filteredIncidents.length === 0 && (

            <div className="tx-admin-alerts-empty">

              <AlertTriangle size={28} />

              <strong>
                No incidents found
              </strong>

              <span>
                Try changing your search or severity filter.
              </span>

            </div>

          )}

        </div>

      </section>


      {/* INCIDENT DETAIL */}

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
                className={`tx-admin-alert-severity ${selectedIncident.severity.toLowerCase()}`}
              >
                {selectedIncident.severity}
              </span>

              <span
                className={`tx-admin-alert-status ${selectedIncident.status.toLowerCase()}`}
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
                  {selectedIncident.confidence}%
                </strong>
              </div>

              <div>
                <span>TEMPERATURE</span>
                <strong>
                  {selectedIncident.temperature}
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
                  {selectedIncident.time}
                </strong>
              </div>

            </div>


            <div className="tx-admin-alert-detail-note">

              <span>
                ADMIN NOTE
              </span>

              <p>
                Incident details and AI analysis can
                be connected to the backend detection
                pipeline later.
              </p>

            </div>

          </aside>

        </div>

      )}

    </div>
  );
};

export default AdminAlerts;