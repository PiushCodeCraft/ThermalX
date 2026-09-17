import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  CalendarDays,
  Filter,
  Search,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

import "./Reports.css";

const API_URL = "http://localhost:5000";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ==================================================
  // FETCH USER REQUESTS
  // ==================================================

  const fetchRequests = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/user-requests`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch requests (${response.status})`
        );
      }

      const result = await response.json();

      console.log("📩 User requests from Supabase:", result);

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load requests"
        );
      }

      setReports(result.data || []);

    } catch (err) {
      console.error(
        "❌ User request fetch error:",
        err
      );

      setError(
        err.message || "Failed to load user requests"
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // ==================================================
  // INITIAL LOAD + AUTOMATIC REFRESH
  // ==================================================

  useEffect(() => {
    // Load immediately
    fetchRequests(true);

    // Check for new requests every 10 seconds
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 10000);

    // Stop polling when leaving Reports page
    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // UPDATE REQUEST STATUS
  // ==================================================

  const updateStatus = async (requestId, newStatus) => {
    try {
      setUpdatingId(requestId);
      setError("");

      console.log(
        `🔄 Updating request ${requestId} → ${newStatus}`
      );

      const response = await fetch(
        `${API_URL}/api/user-requests/${requestId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      console.log(
        "📩 Status update response:",
        result
      );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to update request status"
        );
      }

      // Update UI immediately
      setReports((previousReports) =>
        previousReports.map((request) =>
          String(request.id) ===
          String(requestId)
            ? {
                ...request,
                status: newStatus,
              }
            : request
        )
      );

    } catch (err) {
      console.error(
        "❌ Status update error:",
        err
      );

      setError(
        err.message ||
          "Failed to update request status"
      );

    } finally {
      setUpdatingId(null);
    }
  };

  // ==================================================
  // STATUS
  // ==================================================

  const getStatus = (request) => {
    return String(
      request.status || "pending"
    ).toLowerCase();
  };

  // ==================================================
  // FILTER
  // ==================================================

  const filteredReports = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return reports.filter((request) => {
      const currentStatus =
        getStatus(request);

      const requestId = String(
        request.id || ""
      ).toLowerCase();

      const name = String(
        request.name ||
          request.full_name ||
          request.username ||
          ""
      ).toLowerCase();

      const email = String(
        request.email || ""
      ).toLowerCase();

      const requestType = String(
        request.request_type ||
          request.type ||
          ""
      ).toLowerCase();

      const description = String(
        request.description ||
          request.message ||
          ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        requestId.includes(searchText) ||
        name.includes(searchText) ||
        email.includes(searchText) ||
        requestType.includes(searchText) ||
        description.includes(searchText);

      const matchesStatus =
        status === "All" ||
        currentStatus ===
          status.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [reports, search, status]);

  // ==================================================
  // SUMMARY
  // ==================================================

  const totalRequests = reports.length;

  const pendingRequests =
    reports.filter(
      (request) =>
        getStatus(request) ===
        "pending"
    ).length;

  const approvedRequests =
    reports.filter(
      (request) =>
        getStatus(request) ===
        "approved"
    ).length;

  const deniedRequests =
    reports.filter(
      (request) =>
        getStatus(request) ===
        "denied"
    ).length;

  // ==================================================
  // DATE
  // ==================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  // ==================================================
  // DOWNLOAD
  // ==================================================

  const downloadRequest = (request) => {
    try {
      const fileContent =
        JSON.stringify(
          request,
          null,
          2
        );

      const blob = new Blob(
        [fileContent],
        {
          type: "application/json",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `thermalx-request-${request.id}.json`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(
        "❌ Download error:",
        err
      );
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <main className="tx-reports">

      {/* HEADER */}

      <div className="tx-reports-header">
        <div>
          <h1>Reports</h1>

          <p>
            Manage user requests and approvals
          </p>
        </div>
      </div>


      {/* SUMMARY */}

      <div className="tx-reports-summary">

        <div className="tx-reports-summary-card">
          <span>
            Total Requests
          </span>

          <strong>
            {totalRequests}
          </strong>
        </div>

        <div className="tx-reports-summary-card">
          <span>
            Pending
          </span>

          <strong>
            {pendingRequests}
          </strong>
        </div>

        <div className="tx-reports-summary-card">
          <span>
            Approved
          </span>

          <strong>
            {approvedRequests}
          </strong>
        </div>

        <div className="tx-reports-summary-card">
          <span>
            Denied
          </span>

          <strong>
            {deniedRequests}
          </strong>
        </div>

      </div>


      {/* REQUEST CARD */}

      <div className="tx-reports-card">

        {/* FILTERS */}

        <div className="tx-reports-filters">

          <div className="tx-reports-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          <div className="tx-reports-filter">

            <Filter size={18} />

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="All">
                All
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Denied">
                Denied
              </option>
            </select>

          </div>


          <button
            type="button"
            className="tx-reports-refresh"
            onClick={() =>
              fetchRequests(true)
            }
            disabled={loading}
            title="Refresh requests"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "tx-reports-refresh-spin"
                  : ""
              }
            />
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="tx-reports-api-error">

            <div>
              <strong>
                Unable to load requests
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchRequests(true)
              }
              disabled={loading}
            >
              <RefreshCw size={14} />
              Retry
            </button>

          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="tx-reports-empty">

            <strong>
              Loading user requests...
            </strong>

            <span>
              Checking Supabase
            </span>

          </div>

        ) : (

          /* TABLE */

          <div className="tx-reports-table">

            <table>

              <thead>

                <tr>

                  <th>
                    REQUEST ID
                  </th>

                  <th>
                    USER
                  </th>

                  <th>
                    EMAIL
                  </th>

                  <th>
                    TYPE
                  </th>

                  <th>
                    DATE
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredReports.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="tx-reports-empty"
                    >

                      <FileText
                        size={22}
                      />

                      <strong>
                        No user requests found
                      </strong>

                      <span>
                        New requests will appear automatically.
                      </span>

                    </td>

                  </tr>

                ) : (

                  filteredReports.map(
                    (request) => {

                      const currentStatus =
                        getStatus(request);

                      const isUpdating =
                        String(
                          updatingId
                        ) ===
                        String(
                          request.id
                        );

                      return (

                        <tr
                          key={
                            request.id
                          }
                        >

                          {/* REQUEST ID */}

                          <td className="tx-report-id">
                            {request.id ||
                              "-"}
                          </td>


                          {/* USER */}

                          <td>

                            <div className="tx-report-name">

                              <div className="tx-report-file-icon">
                                <FileText
                                  size={16}
                                />
                              </div>

                              <strong>
                                {request.name ||
                                  request.full_name ||
                                  request.username ||
                                  "-"}
                              </strong>

                            </div>

                          </td>


                          {/* EMAIL */}

                          <td>
                            {request.email ||
                              "-"}
                          </td>


                          {/* TYPE */}

                          <td>
                            {request.request_type ||
                              request.type ||
                              "-"}
                          </td>


                          {/* DATE */}

                          <td>

                            <span
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                              }}
                            >
                              <CalendarDays
                                size={15}
                              />

                              {formatDate(
                                request.created_at
                              )}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`tx-report-status ${currentStatus}`}
                            >
                              {currentStatus}
                            </span>

                          </td>


                          {/* ACTION */}

                          <td>

                            {currentStatus ===
                            "pending" ? (

                              <div className="tx-request-actions">

                                {/* PERMIT */}

                                <button
                                  type="button"
                                  className="tx-request-permit"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      request.id,
                                      "approved"
                                    )
                                  }
                                >

                                  <Check
                                    size={16}
                                  />

                                  {isUpdating
                                    ? "..."
                                    : "Permit"}

                                </button>


                                {/* DENY */}

                                <button
                                  type="button"
                                  className="tx-request-deny"
                                  disabled={
                                    isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      request.id,
                                      "denied"
                                    )
                                  }
                                >

                                  <X
                                    size={16}
                                  />

                                  {isUpdating
                                    ? "..."
                                    : "Deny"}

                                </button>

                              </div>

                            ) : (

                              <div className="tx-request-actions">

                                <button
                                  type="button"
                                  className="tx-report-download"
                                  onClick={() =>
                                    downloadRequest(
                                      request
                                    )
                                  }
                                >

                                  <Download
                                    size={16}
                                  />

                                  Download

                                </button>

                                <span className="tx-request-completed">
                                  Completed
                                </span>

                              </div>

                            )}

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </main>
  );
};

export default Reports;