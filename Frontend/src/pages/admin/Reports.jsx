import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  CalendarDays,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  getReports,
  getReport,
} from "../../services/api";

import "./Reports.css";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const normalizeReports = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.reports)) {
      return response.reports;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const getValue = (item, keys, fallback = "N/A") => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        item?.[key] !== ""
      ) {
        return item[key];
      }
    }

    return fallback;
  };

  const normalizeReport = (item) => ({
    raw: item,

    id: getValue(
      item,
      [
        "id",
        "reportId",
        "report_id",
      ]
    ),

    title: getValue(
      item,
      [
        "title",
        "name",
        "reportTitle",
        "report_title",
      ]
    ),

    type: getValue(
      item,
      [
        "type",
        "reportType",
        "report_type",
        "category",
      ]
    ),

    date: getValue(
      item,
      [
        "date",
        "createdAt",
        "created_at",
        "generatedAt",
        "generated_at",
        "updatedAt",
        "updated_at",
      ]
    ),

    incidents: getValue(
      item,
      [
        "incidents",
        "incidentCount",
        "incident_count",
        "totalIncidents",
        "total_incidents",
      ]
    ),

    status: getValue(
      item,
      [
        "status",
        "state",
      ]
    ),

    downloadUrl: getValue(
      item,
      [
        "downloadUrl",
        "download_url",
        "pdfUrl",
        "pdf_url",
        "fileUrl",
        "file_url",
      ],
      null
    ),
  });

  const formatDate = (value) => {
    if (!value || value === "N/A") {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getReports();

      const data = normalizeReports(response);

      setReports(data);
    } catch (err) {
      console.error(
        "Reports loading failed:",
        err
      );

      setReports([]);

      setError(
        err?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const normalizedReports = useMemo(
    () => reports.map(normalizeReport),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedReports.filter(
      (report) => {
        const matchesSearch =
          !query ||
          String(report.title)
            .toLowerCase()
            .includes(query) ||
          String(report.id)
            .toLowerCase()
            .includes(query) ||
          String(report.type)
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          status === "All" ||
          String(report.status).toLowerCase() ===
            status.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    normalizedReports,
    search,
    status,
  ]);

  const generatedToday = useMemo(() => {
    const today = new Date();

    return normalizedReports.filter(
      (report) => {
        if (
          !report.raw?.createdAt &&
          !report.raw?.created_at &&
          !report.raw?.generatedAt &&
          !report.raw?.generated_at &&
          !report.raw?.date
        ) {
          return false;
        }

        const rawDate = getValue(
          report.raw,
          [
            "createdAt",
            "created_at",
            "generatedAt",
            "generated_at",
            "date",
          ],
          null
        );

        if (!rawDate) {
          return false;
        }

        const date = new Date(rawDate);

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        return (
          date.getFullYear() ===
            today.getFullYear() &&
          date.getMonth() ===
            today.getMonth() &&
          date.getDate() ===
            today.getDate()
        );
      }
    ).length;
  }, [normalizedReports]);

  const availableDownloads = useMemo(
    () =>
      normalizedReports.filter(
        (report) =>
          String(report.status).toLowerCase() ===
          "ready"
      ).length,
    [normalizedReports]
  );

  const handleDownload = async (report) => {
    if (
      !report ||
      String(report.status).toLowerCase() !==
        "ready"
    ) {
      return;
    }

    setDownloadingId(report.id);

    try {
      /*
       * First request the complete report.
       *
       * The backend can return:
       * - downloadUrl
       * - pdfUrl
       * - fileUrl
       * - or the complete report object.
       */
      const response =
        await getReport(report.id);

      const detail =
        response?.data ??
        response?.report ??
        response;

      const downloadUrl =
        getValue(
          detail,
          [
            "downloadUrl",
            "download_url",
            "pdfUrl",
            "pdf_url",
            "fileUrl",
            "file_url",
          ],
          report.downloadUrl
        );

      if (
        downloadUrl &&
        downloadUrl !== "N/A"
      ) {
        window.open(
          downloadUrl,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      /*
       * No fabricated download is created.
       * The backend must provide the actual
       * report/PDF URL.
       */
      alert(
        "The report is ready, but the backend has not provided a PDF download URL."
      );
    } catch (err) {
      console.error(
        "Report download failed:",
        err
      );

      alert(
        err?.message ||
          "Unable to download the report."
      );
    } finally {
      setDownloadingId(null);
    }
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
          onClick={() => {
            /*
             * Report creation endpoint is not
             * currently defined in api.js.
             *
             * Do not send a fabricated request.
             */
            alert(
              "Report creation will be available when the backend report-generation endpoint is connected."
            );
          }}
        >
          <FileText size={16} />
          CREATE REPORT
        </button>

      </header>


      {/* ERROR */}

      {error && (
        <div className="tx-reports-api-error">

          <div>
            <strong>
              Unable to load reports
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCw size={14} />
            RETRY
          </button>

        </div>
      )}


      {/* SUMMARY */}

      <section className="tx-reports-summary">

        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <FileText size={19} />
          </div>

          <div>
            <span>Total Reports</span>

            <strong>
              {loading
                ? "..."
                : normalizedReports.length}
            </strong>
          </div>

        </div>


        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>Generated Today</span>

            <strong>
              {loading
                ? "..."
                : generatedToday}
            </strong>
          </div>

        </div>


        <div className="tx-reports-summary-card">

          <div className="tx-reports-summary-icon">
            <Download size={19} />
          </div>

          <div>
            <span>Available Downloads</span>

            <strong>
              {loading
                ? "..."
                : availableDownloads}
            </strong>
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

            <h2>
              Generated Reports
            </h2>
          </div>

          <button
            type="button"
            className="tx-reports-refresh"
            onClick={loadReports}
            disabled={loading}
            aria-label="Refresh reports"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "tx-reports-refresh-spin"
                  : ""
              }
            />
          </button>

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

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="tx-reports-empty"
                  >
                    <RefreshCw
                      size={18}
                      className="tx-reports-refresh-spin"
                    />

                    <span>
                      Loading reports...
                    </span>
                  </td>
                </tr>

              ) : filteredReports.length > 0 ? (

                filteredReports.map(
                  (report) => (

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
                        {formatDate(
                          report.date
                        )}
                      </td>

                      <td>
                        {report.incidents}
                      </td>

                      <td>
                        <span
                          className={`tx-report-status ${
                            String(
                              report.status
                            ).toLowerCase()
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
                            String(
                              report.status
                            ).toLowerCase() !==
                              "ready" ||
                            downloadingId ===
                              report.id
                          }
                          onClick={() =>
                            handleDownload(
                              report
                            )
                          }
                        >

                          {downloadingId ===
                          report.id ? (
                            <RefreshCw
                              size={14}
                              className="tx-reports-refresh-spin"
                            />
                          ) : (
                            <Download size={14} />
                          )}

                          {downloadingId ===
                          report.id
                            ? "..."
                            : "PDF"}

                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="tx-reports-empty"
                  >
                    <FileText size={22} />

                    <strong>
                      No reports found
                    </strong>

                    <span>
                      No report records match the
                      current filters.
                    </span>
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