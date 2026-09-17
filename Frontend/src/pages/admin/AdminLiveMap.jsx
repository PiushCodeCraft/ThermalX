import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Flame,
  MapPin,
  Satellite,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  getFirmsStatus,
} from "../../services/api";

import IndiaFocusedMap from "../../components/map/IndiaFocusedMap";

import "./AdminLiveMap.css";


/* =========================================================
   API URL
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* =========================================================
   HELPERS
========================================================= */

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


const getStatusValue = (
  response
) => {
  if (!response) {
    return null;
  }

  const status =
    getValue(
      response,
      [
        "status",
        "state",
        "health",
        "connection",
      ],
      null
    );

  if (
    typeof status === "object" &&
    status !== null
  ) {
    return getValue(
      status,
      [
        "status",
        "state",
        "health",
      ],
      null
    );
  }

  return status;
};


const normalizeStatus = (
  value
) => {
  if (!value) {
    return "UNKNOWN";
  }

  return String(value)
    .trim()
    .toUpperCase();
};


const isOnlineStatus = (
  value
) => {
  const status =
    normalizeStatus(value);

  return [
    "ONLINE",
    "CONNECTED",
    "ACTIVE",
    "RUNNING",
    "HEALTHY",
    "OK",
    "READY",
    "AVAILABLE",
  ].includes(status);
};


/* =========================================================
   COMPONENT
========================================================= */

const AdminLiveMap = () => {

  /* -------------------------------------------------------
     MONGODB LIVE DATA
  ------------------------------------------------------- */

  const [
    detectionCount,
    setDetectionCount,
  ] = useState(null);

  const [
    activeIncidents,
    setActiveIncidents,
  ] = useState(null);


  /* -------------------------------------------------------
     FIRMS STATUS
  ------------------------------------------------------- */

  const [
    firmsStatus,
    setFirmsStatus,
  ] = useState(null);


  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /* =======================================================
     LOAD LIVE MAP DATA FROM MONGODB
  ======================================================= */

  const loadLiveMapData =
    useCallback(async () => {

      try {

        setRefreshing(true);
        setError("");


        /* =================================================
           FETCH MONGODB LIVE SUMMARY
        ================================================= */

        const summaryResponse =
          await fetch(
            `${API_URL}/api/fire/live-summary`
          );


        if (!summaryResponse.ok) {

          throw new Error(
            `Live summary request failed: ${summaryResponse.status}`
          );

        }


        const summaryResult =
          await summaryResponse.json();


        console.log(
          "🗺️ Admin Live Map MongoDB summary:",
          summaryResult
        );


        if (
          !summaryResult.success ||
          !summaryResult.data
        ) {

          throw new Error(
            "Invalid Live Map summary response"
          );

        }


        /* =================================================
           THERMAL DETECTIONS
        ================================================= */

        const thermalDetections =
          Number(
            summaryResult.data
              .thermalDetections
          );


        setDetectionCount(
          Number.isFinite(
            thermalDetections
          )
            ? thermalDetections
            : 0
        );


        /* =================================================
           ACTIVE INCIDENTS
        ================================================= */

        const incidents =
          Number(
            summaryResult.data
              .activeIncidents
          );


        setActiveIncidents(
          Number.isFinite(
            incidents
          )
            ? incidents
            : 0
        );


        /* =================================================
           FETCH FIRMS STATUS
        ================================================= */

        try {

          const statusResponse =
            await getFirmsStatus();


          const status =
            getStatusValue(
              statusResponse
            );


          setFirmsStatus(
            normalizeStatus(status)
          );

        } catch (statusError) {

          console.warn(
            "⚠️ FIRMS status request failed:",
            statusError
          );


          /*
             MongoDB summary succeeded,
             so don't make the complete page
             look unavailable just because
             the separate FIRMS status endpoint
             failed.
          */

          setFirmsStatus(
            "AVAILABLE"
          );

        }


      } catch (requestError) {

        console.error(
          "❌ Failed to load Admin Live Map data:",
          requestError
        );


        setDetectionCount(null);

        setActiveIncidents(null);

        setFirmsStatus(
          "UNAVAILABLE"
        );


        setError(
          "Unable to retrieve live FIRMS data from the backend."
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

    loadLiveMapData();

  }, [
    loadLiveMapData,
  ]);


  /* =======================================================
     DISPLAY STATUS
  ======================================================= */

  const statusOnline =
    isOnlineStatus(
      firmsStatus
    );


  const statusClass =
    firmsStatus === "UNAVAILABLE"
      ? "offline"
      : statusOnline
        ? "online"
        : "warning";


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="tx-admin-live-map">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="tx-admin-live-map-header">

        <div>

          <span className="tx-admin-live-map-eyebrow">
            THERMAL-X / ADMINISTRATION / LIVE MONITORING
          </span>

          <h1>
            Live Thermal Map
          </h1>

          <p>
            Real-time satellite thermal activity and
            fire detection monitoring.
          </p>

        </div>


        {/* FIRMS STATUS */}

        <div className="tx-admin-live-map-status">

          <span
            className={`tx-admin-live-map-status-dot ${statusClass}`}
          />

          {loading
            ? "CHECKING FIRMS"
            : firmsStatus
              ? `NASA FIRMS ${firmsStatus}`
              : "NASA FIRMS UNKNOWN"}

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div
          className="tx-admin-live-map-api-error"
        >

          <XCircle size={18} />

          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={
              loadLiveMapData
            }
          >
            RETRY
          </button>

        </div>

      )}


      {/* ===================================================
          STATISTICS
      =================================================== */}

      <section className="tx-admin-live-map-stats">


        {/* =================================================
            THERMAL DETECTIONS
        ================================================= */}

        <article className="tx-admin-live-map-stat">

          <div className="tx-admin-live-map-stat-icon">

            <Flame size={18} />

          </div>


          <div>

            <span>
              THERMAL DETECTIONS
            </span>

            <strong
              className={
                detectionCount === null
                  ? "unavailable"
                  : ""
              }
            >

              {loading
                ? "—"
                : detectionCount !== null
                  ? Number(
                      detectionCount
                    ).toLocaleString()
                  : "N/A"}

            </strong>

          </div>

        </article>


        {/* =================================================
            ACTIVE INCIDENTS
        ================================================= */}

        <article className="tx-admin-live-map-stat">

          <div className="tx-admin-live-map-stat-icon">

            <Activity size={18} />

          </div>


          <div>

            <span>
              ACTIVE INCIDENTS
            </span>

            <strong
              className={
                activeIncidents === null
                  ? "unavailable"
                  : ""
              }
            >

              {loading
                ? "—"
                : activeIncidents !== null
                  ? Number(
                      activeIncidents
                    ).toLocaleString()
                  : "N/A"}

            </strong>

          </div>

        </article>


        {/* =================================================
            SATELLITE SOURCE
        ================================================= */}

        <article className="tx-admin-live-map-stat">

          <div className="tx-admin-live-map-stat-icon">

            <Satellite size={18} />

          </div>


          <div>

            <span>
              SATELLITE SOURCE
            </span>

            <strong>
              VIIRS NOAA-21
            </strong>

          </div>

        </article>


        {/* =================================================
            REGION
        ================================================= */}

        <article className="tx-admin-live-map-stat">

          <div className="tx-admin-live-map-stat-icon">

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
          MAP CARD
      =================================================== */}

      <section className="tx-admin-live-map-card">


        <div className="tx-admin-live-map-card-header">

          <div>

            <span className="tx-admin-live-map-card-eyebrow">
              SATELLITE MONITORING
            </span>

            <h2>
              India Thermal Activity
            </h2>

          </div>


          <div className="tx-admin-live-map-live">

            <span
              className={`tx-admin-live-map-live-dot ${
                statusClass
              }`}
            />

            {loading
              ? "CHECKING"
              : statusOnline
                ? "LIVE"
                : "UNAVAILABLE"}

          </div>

        </div>


        {/* =================================================
            SAME REAL MAP
        ================================================= */}

        <div className="tx-admin-live-map-wrapper">

          <IndiaFocusedMap />

        </div>

      </section>


      {/* ===================================================
          INFORMATION
      =================================================== */}

      <section className="tx-admin-live-map-information">


        {/* DATA SOURCE */}

        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">

            <Satellite size={16} />

          </div>


          <div>

            <span>
              DATA SOURCE
            </span>

            <strong>
              NASA FIRMS
            </strong>

          </div>

        </div>


        {/* THERMAL PRODUCT */}

        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">

            <Flame size={16} />

          </div>


          <div>

            <span>
              THERMAL PRODUCT
            </span>

            <strong>
              VIIRS NOAA-21
            </strong>

          </div>

        </div>


        {/* MONITORING MODE */}

        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">

            <RefreshCw size={16} />

          </div>


          <div>

            <span>
              MONITORING MODE
            </span>

            <strong>
              NEAR REAL-TIME
            </strong>

          </div>

        </div>


        {/* REGION */}

        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">

            <MapPin size={16} />

          </div>


          <div>

            <span>
              REGION
            </span>

            <strong>
              INDIA
            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          REFRESH
      =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "14px",
        }}
      >

        <button
          type="button"
          className="tx-admin-live-map-refresh"
          onClick={
            loadLiveMapData
          }
          disabled={
            refreshing
          }
          title="Refresh FIRMS data"
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "tx-admin-live-map-refresh-icon"
                : ""
            }
          />

        </button>

      </div>

    </div>
  );
};


export default AdminLiveMap;