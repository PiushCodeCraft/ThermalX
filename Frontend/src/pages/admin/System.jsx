import React, { useCallback, useEffect, useState } from "react";

import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  RefreshCw,
  Satellite,
  Server,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import "./System.css";


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================================
   HELPERS
========================================================= */

const formatUptime = (seconds) => {
  if (
    typeof seconds !== "number" ||
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return "Unavailable";
  }

  const days = Math.floor(seconds / 86400);

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }

  parts.push(`${minutes}m`);

  return parts.join(" ");
};


const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
};


const normalizeStatus = (status) => {
  if (!status) {
    return "unknown";
  }

  return String(status).toLowerCase();
};


const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    online: "Online",
    connected: "Connected",
    active: "Active",
    running: "Running",
    ready: "Ready",
    healthy: "Healthy",
    configured: "Configured",
    offline: "Offline",
    error: "Error",
    failed: "Failed",
    unavailable: "Unavailable",
    unknown: "Unknown",
    "not-configured": "Not Configured",
  };

  return labels[normalized] || "Unknown";
};


const getStatusClass = (status) => {
  const normalized = normalizeStatus(status);

  if (
    [
      "online",
      "connected",
      "active",
      "running",
      "ready",
      "healthy",
    ].includes(normalized)
  ) {
    return "online";
  }

  if (
    [
      "offline",
      "error",
      "failed",
    ].includes(normalized)
  ) {
    return "offline";
  }

  if (
    [
      "configured",
    ].includes(normalized)
  ) {
    return "configured";
  }

  return "unknown";
};


/* =========================================================
   STATUS ICON
========================================================= */

const StatusIndicator = ({
  status,
}) => {
  const normalized = normalizeStatus(status);

  if (
    [
      "online",
      "connected",
      "active",
      "running",
      "ready",
      "healthy",
    ].includes(normalized)
  ) {
    return (
      <CheckCircle2
        size={17}
        className="tx-system-status-icon online"
      />
    );
  }

  if (
    [
      "offline",
      "error",
      "failed",
    ].includes(normalized)
  ) {
    return (
      <XCircle
        size={17}
        className="tx-system-status-icon offline"
      />
    );
  }

  return (
    <CircleAlert
      size={17}
      className="tx-system-status-icon unknown"
    />
  );
};


/* =========================================================
   SERVICE CARD
========================================================= */

const ServiceCard = ({
  icon: Icon,
  title,
  description,
  status,
  detail,
}) => {
  const statusClass =
    getStatusClass(status);

  return (
    <article className="tx-system-service-card">

      <div className="tx-system-service-icon">
        <Icon size={20} />
      </div>

      <div className="tx-system-service-content">

        <div className="tx-system-service-title">
          {title}
        </div>

        <div className="tx-system-service-description">
          {description}
        </div>

        {detail && (
          <div className="tx-system-service-detail">
            {detail}
          </div>
        )}

      </div>

      <div
        className={`tx-system-service-status ${statusClass}`}
      >
        <StatusIndicator
          status={status}
        />

        <span>
          {getStatusLabel(status)}
        </span>
      </div>

    </article>
  );
};


/* =========================================================
   SYSTEM PAGE
========================================================= */

const System = () => {

  const [systemStatus, setSystemStatus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [autoRefresh, setAutoRefresh] =
    useState(true);


  /* =======================================================
     FETCH SYSTEM STATUS
  ======================================================= */

  const fetchSystemStatus =
    useCallback(async () => {

      try {

        setRefreshing(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/system/status`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `System API returned ${response.status}`
          );
        }

        const data =
          await response.json();

        setSystemStatus(data);

      } catch (requestError) {

        console.error(
          "System status request failed:",
          requestError
        );

        setError(
          "Unable to retrieve current system status."
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
    fetchSystemStatus();
  }, [fetchSystemStatus]);


  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {

    if (!autoRefresh) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
    };

  }, [
    autoRefresh,
    fetchSystemStatus,
  ]);


  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const backendStatus =
    systemStatus?.backend?.status ||
    "unknown";

  const postgresStatus =
    systemStatus?.postgresql?.status ||
    "unknown";

  const mongoStatus =
    systemStatus?.mongodb?.status ||
    "unknown";

  const firmsStatus =
    systemStatus?.nasaFirms?.status ||
    "unknown";

  const aiStatus =
    systemStatus?.aiDetection?.status ||
    "unknown";


  const serviceStatuses = [
    backendStatus,
    postgresStatus,
    mongoStatus,
    firmsStatus,
    aiStatus,
  ].map(normalizeStatus);


  const hasOfflineService =
    serviceStatuses.some(
      (status) =>
        [
          "offline",
          "error",
          "failed",
        ].includes(status)
    );


  const allHealthy =
    systemStatus &&
    !hasOfflineService &&
    serviceStatuses.every(
      (status) =>
        status !== "unknown"
    );


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="tx-system-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="tx-system-header">

        <div>

          <span className="tx-system-eyebrow">
            THERMAL-X / ADMINISTRATION
          </span>

          <h1>
            System
          </h1>

          <p>
            Monitor THERMAL-X services,
            data pipelines and system health.
          </p>

        </div>


        <div className="tx-system-header-actions">

          <label className="tx-system-auto-refresh">

            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) =>
                setAutoRefresh(
                  event.target.checked
                )
              }
            />

            <span>
              AUTO REFRESH
            </span>

          </label>


          <button
            type="button"
            className="tx-system-refresh-button"
            onClick={fetchSystemStatus}
            disabled={refreshing}
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "tx-system-spin"
                  : ""
              }
            />

            {refreshing
              ? "CHECKING..."
              : "REFRESH STATUS"}

          </button>

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="tx-system-error">

          <WifiOff size={18} />

          <div>
            <strong>
              System API unavailable
            </strong>

            <span>
              {error}
            </span>
          </div>

        </div>
      )}


      {/* ===================================================
          GLOBAL STATUS
      =================================================== */}

      <section className="tx-system-global-status">

        <div className="tx-system-global-left">

          <span
            className={`tx-system-global-dot ${
              allHealthy
                ? "online"
                : hasOfflineService
                ? "offline"
                : "unknown"
            }`}
          />

          <strong>

            {loading
              ? "CHECKING SYSTEM STATUS"
              : allHealthy
              ? "ALL SYSTEMS OPERATIONAL"
              : hasOfflineService
              ? "SYSTEM ISSUES DETECTED"
              : "SYSTEM STATUS UNKNOWN"}

          </strong>

        </div>


        <div className="tx-system-last-check">

          <Clock3 size={15} />

          <span>
            Last checked:
          </span>

          <strong>
            {formatDateTime(
              systemStatus?.timestamp
            )}
          </strong>

        </div>

      </section>


      {/* ===================================================
          OVERVIEW CARDS
      =================================================== */}

      <section className="tx-system-overview">

        <ServiceCard
          icon={Server}
          title="Backend API"
          description="THERMAL-X application server"
          status={backendStatus}
          detail={
            systemStatus?.backend
              ?.uptimeSeconds !== undefined
              ? `Uptime: ${formatUptime(
                  systemStatus.backend
                    .uptimeSeconds
                )}`
              : null
          }
        />


        <ServiceCard
          icon={Database}
          title="PostgreSQL Database"
          description="Incident and detection storage"
          status={postgresStatus}
        />


        <ServiceCard
          icon={Database}
          title="MongoDB"
          description="Application data storage"
          status={mongoStatus}
        />


        <ServiceCard
          icon={Activity}
          title="System Uptime"
          description="Backend process uptime"
          status={
            systemStatus
              ? backendStatus
              : "unknown"
          }
          detail={
            systemStatus?.backend
              ?.uptimeSeconds !== undefined
              ? formatUptime(
                  systemStatus.backend
                    .uptimeSeconds
                )
              : "Unavailable"
          }
        />

      </section>


      {/* ===================================================
          SERVICES
      =================================================== */}

      <section className="tx-system-services-panel">

        <div className="tx-system-panel-header">

          <div>

            <span className="tx-system-panel-eyebrow">
              SERVICES
            </span>

            <h2>
              System Services
            </h2>

            <p>
              Live health information reported
              by the THERMAL-X backend.
            </p>

          </div>


          <div className="tx-system-service-count">

            {systemStatus
              ? "5 SERVICES"
              : "STATUS UNAVAILABLE"}

          </div>

        </div>


        <div className="tx-system-services-list">

          <ServiceCard
            icon={Satellite}
            title="NASA FIRMS Data Service"
            description="Satellite thermal data ingestion"
            status={firmsStatus}
            detail={
              systemStatus?.nasaFirms
                ?.lastCollection
                ? `Last collection: ${formatDateTime(
                    systemStatus.nasaFirms
                      .lastCollection
                  )}`
                : undefined
            }
          />


          <ServiceCard
            icon={BrainCircuit}
            title="AI Detection Engine"
            description="Thermal fire-risk classification"
            status={aiStatus}
            detail={
              systemStatus?.aiDetection
                ?.modelVersion
                ? `Model: ${systemStatus.aiDetection.modelVersion}`
                : undefined
            }
          />


          <ServiceCard
            icon={Database}
            title="PostgreSQL Database"
            description="Incident and detection storage"
            status={postgresStatus}
          />


          <ServiceCard
            icon={Server}
            title="Backend API"
            description="THERMAL-X application services"
            status={backendStatus}
            detail={
              systemStatus?.backend
                ?.version
                ? `Version: ${systemStatus.backend.version}`
                : undefined
            }
          />

        </div>

      </section>


      {/* ===================================================
          CONNECTION INFORMATION
      =================================================== */}

      <section className="tx-system-connection-panel">

        <div className="tx-system-panel-header">

          <div>

            <span className="tx-system-panel-eyebrow">
              CONNECTION
            </span>

            <h2>
              API Connection
            </h2>

          </div>

          <Wifi
            size={19}
          />

        </div>


        <div className="tx-system-connection-grid">

          <div className="tx-system-connection-row">

            <span>
              API Endpoint
            </span>

            <strong>
              {API_URL}/api/system/status
            </strong>

          </div>


          <div className="tx-system-connection-row">

            <span>
              Connection
            </span>

            <strong
              className={
                systemStatus
                  ? "connected"
                  : "disconnected"
              }
            >
              {loading
                ? "Checking..."
                : systemStatus
                ? "Connected"
                : "Disconnected"}
            </strong>

          </div>


          <div className="tx-system-connection-row">

            <span>
              Automatic Refresh
            </span>

            <strong>
              {autoRefresh
                ? "Every 30 seconds"
                : "Disabled"}
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
};

export default System;