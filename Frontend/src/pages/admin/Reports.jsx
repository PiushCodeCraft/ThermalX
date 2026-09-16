import React, { useMemo, useState } from "react";
import {
  Download,
  FileText,
  CalendarDays,
  Filter,
  Search,
} from "lucide-react";

import "./Reports.css";

const Reports = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const reports = [
    {
      id: "RPT-001",
      title: "Daily Thermal Incident Report",
      type: "Incident Report",
      date: "16 Sep 2026",
      incidents: 24,
      status: "Ready",
    },
    {
      id: "RPT-002",
      title: "AI Detection Analysis Report",
      type: "AI Analysis",
      date: "16 Sep 2026",
      incidents: 73,
      status: "Ready",
    },
    {
      id: "RPT-003",
      title: "Weekly Thermal Activity Report",
      type: "Weekly Report",
      date: "15 Sep 2026",
      incidents: 186,
      status: "Ready",
    },
    {
      id: "RPT-004",
      title: "Regional Risk Summary",
      type: "Risk Analysis",
      date: "15 Sep 2026",
      incidents: 41,
      status: "Processing",
    },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        report.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" ||
        report.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const handleDownload = (report) => {
    /*
      Backend PDF generation will be connected here later.
    */

    console.log(
      `Download requested: ${report.id}`
    );
  };

  return (
    <div className="tx-reports">

      {/* HEADER */}

      <header className="tx-reports-header">

        <div>
          <span className="tx-reports-eyebrow">
            THERMAL-X / REPORTING
          </span>

          <h1>Reports</h1>

          <p>
            Generate, review and export thermal
            incident and AI analysis reports.
          </p>
        </div>

        <button
          type="button"
          className="tx-reports-create-button"
        >
          <FileText size={16} />
          CREATE REPORT
        </button>

      </header>


      {/* SUMMARY */}

      <section className="tx-reports-summary">

        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>Total Reports</span>
            <strong>4</strong>
          </div>

        </div>


        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Generated Today</span>
            <strong>2</strong>
          </div>

        </div>


        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <Download size={19} />
          </div>

          <div>
            <span>Available Downloads</span>
            <strong>3</strong>
          </div>

        </div>

      </section>


      {/* REPORT TABLE */}

      <section className="tx-reports-card">

        <div className="tx-reports-card-header">

          <div>
            <span className="tx-reports-card-eyebrow">
              REPORT ARCHIVE
            </span>

            <h2>Generated Reports</h2>
          </div>

        </div>


        {/* FILTERS */}

        <div className="tx-reports-filters">

          <div className="tx-reports-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="tx-reports-filter">

            <Filter size={14} />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Ready">
                Ready
              </option>

              <option value="Processing">
                Processing
              </option>
            </select>

          </div>

        </div>


        {/* TABLE */}

        <div className="tx-reports-table-wrapper">

          <table className="tx-reports-table">

            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>REPORT</th>
                <th>TYPE</th>
                <th>DATE</th>
                <th>INCIDENTS</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>


            <tbody>

              {filteredReports.map((report) => (

                <tr key={report.id}>

                  <td>
                    <span className="tx-report-id">
                      {report.id}
                    </span>
                  </td>

                  <td>
                    <div className="tx-report-name">
                      <div className="tx-report-file-icon">
                        <FileText size={15} />
                      </div>

                      <strong>
                        {report.title}
                      </strong>
                    </div>
                  </td>

                  <td>
                    {report.type}
                  </td>

                  <td>
                    {report.date}
                  </td>

                  <td>
                    {report.incidents}
                  </td>

                  <td>
                    <span
                      className={`tx-report-status ${
                        report.status.toLowerCase()
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td>

                    <button
                      type="button"
                      className="tx-report-download"
                      disabled={
                        report.status !== "Ready"
                      }
                      onClick={() =>
                        handleDownload(report)
                      }
                    >
                      <Download size={14} />
                      PDF
                    </button>

                  </td>

                </tr>

              ))}


              {filteredReports.length === 0 && (

                <tr>
                  <td
                    colSpan="7"
                    className="tx-reports-empty"
                  >
                    No reports found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
};

export default Reports;