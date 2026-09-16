import React, { useEffect, useState } from "react";
import {
  Radio,
  RefreshCw,
} from "lucide-react";

import IndiaFocusedMap from "../components/map/IndiaFocusedMap";

import {
  getFirmsStatus,
  getFirmsDetections,
} from "../services/api";

import "./LiveMap.css";

const LiveMap = ({ role = "basic" }) => {
  const [firmsStatus, setFirmsStatus] = useState(null);
  const [detectionCount, setDetectionCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getValue = (
    object,
    keys,
    fallback = null
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

  const normalizeStatus = (response) => {
    if (!response) return null;

    if (
      response?.data &&
      typeof response.data === "object"
    ) {
      return response.data;
    }

    if (
      response?.status &&
      typeof response.status === "object"
    ) {
      return response.status;
    }

    return response;
  };

  const getDetectionCount = (response) => {
    if (Array.isArray(response)) {
      return response.length;
    }

    if (
      Array.isArray(response?.detections)
    ) {
      return response.detections.length;
    }

    if (
      Array.isArray(response?.data)
    ) {
      return response.data.length;
    }

    if (
      Array.isArray(response?.results)
    ) {
      return response.results.length;
    }

    const count = getValue(
      response,
      [
        "count",
        "total",
        "detectionCount",
        "detection_count",
        "totalDetections",
        "total_detections",
      ],
      null
    );

    return count !== null
      ? Number(count)
      : null;
  };

  const loadFirmsData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        statusResponse,
        detectionsResponse,
      ] = await Promise.all([
        getFirmsStatus(),
        getFirmsDetections(),
      ]);

      setFirmsStatus(
        normalizeStatus(statusResponse)
      );

      setDetectionCount(
        getDetectionCount(
          detectionsResponse
        )
      );
    } catch (err) {
      console.error(
        "FIRMS data loading failed:",
        err
      );

      setFirmsStatus(null);
      setDetectionCount(null);

      setError(
        err?.message ||
          "Unable to load NASA FIRMS status."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFirmsData();
  }, []);

  const rawStatus = getValue(
    firmsStatus,
    [
      "status",
      "state",
      "health",
      "connection",
    ],
    null
  );

  const normalizedStatus =
    rawStatus
      ? String(rawStatus).toLowerCase()
      : "";

  const isOnline =
    normalizedStatus === "online" ||
    normalizedStatus === "active" ||
    normalizedStatus === "connected" ||
    normalizedStatus === "healthy" ||
    normalizedStatus === "ready";

  const statusLabel = loading
    ? "Checking..."
    : rawStatus
    ? String(rawStatus)
    : "Unavailable";

  return (
    <main className="tx-live-map-page">

      {/* ==================================================
          EARTH SPACE BACKGROUND
      ================================================== */}

      <div className="tx-live-map-background">

        <video
          className="tx-live-map-background-video"
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

        <div className="tx-live-map-video-overlay" />

      </div>


      {/* ==================================================
          PAGE CONTENT
      ================================================== */}

      <div className="tx-live-map-content">


        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <section className="tx-live-map-header">

          <div className="tx-live-map-header-left">

            <div className="tx-live-map-breadcrumb">
              THERMAL-X
              <span>/</span>
              Live Map
            </div>

            <h1>
              Live Thermal Activity Map
            </h1>

            <p>
              Real-time NASA FIRMS thermal activity
              across monitored regions of India.
            </p>

          </div>


          <div className="tx-live-map-header-right">

            <div
              className={`tx-live-map-live-status ${
                loading
                  ? "loading"
                  : isOnline
                  ? "online"
                  : "offline"
              }`}
            >

              <span className="tx-live-dot" />

              <div>

                <strong>
                  {statusLabel}
                </strong>

                <small>
                  NASA FIRMS
                </small>

              </div>

            </div>


            <button
              type="button"
              className="tx-live-map-refresh"
              onClick={loadFirmsData}
              disabled={loading}
            >

              <RefreshCw
                size={15}
                className={
                  loading
                    ? "tx-live-map-refresh-spin"
                    : ""
                }
              />

              {loading
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

        </section>


        {/* ==================================================
            API ERROR
        ================================================== */}

        {error && (

          <div className="tx-live-map-api-error">

            <div>
              <strong>
                FIRMS data unavailable
              </strong>

              <span>
                {error}
              </span>
            </div>

            <button
              type="button"
              onClick={loadFirmsData}
              disabled={loading}
            >
              <RefreshCw size={14} />
              RETRY
            </button>

          </div>

        )}


        {/* ==================================================
            MAP INFORMATION BAR
        ================================================== */}

        <section className="tx-live-map-info">

          <div className="tx-live-map-info-item">

            <div className="tx-live-map-info-icon">
              <Radio size={16} />
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


          <div className="tx-live-map-info-divider" />


          <div className="tx-live-map-info-item">

            <div>

              <span>
                SATELLITE
              </span>

              <strong>
                VIIRS NOAA-21
              </strong>

            </div>

          </div>


          <div className="tx-live-map-info-divider" />


          <div className="tx-live-map-info-item">

            <div>

              <span>
                COVERAGE
              </span>

              <strong>
                India
              </strong>

            </div>

          </div>


          <div className="tx-live-map-info-divider" />


          <div className="tx-live-map-info-item">

            <div>

              <span>
                UPDATE
              </span>

              <strong>
                Near Real-Time
              </strong>

            </div>

          </div>

        </section>


        {/* ==================================================
            LIVE MAP
        ================================================== */}

        <section className="tx-live-map-card">

          <div className="tx-live-map-card-header">

            <div>

              <div className="tx-live-map-title-row">

                <span className="tx-live-map-fire-icon">
                  🔥
                </span>

                <h2>
                  Thermal Activity — India
                </h2>

              </div>

              <p>
                Live thermal detections from NASA
                FIRMS VIIRS NOAA-21.
              </p>

            </div>


            <div
              className={`tx-live-map-card-status ${
                loading
                  ? "loading"
                  : isOnline
                  ? "online"
                  : "offline"
              }`}
            >

              <span className="tx-live-dot" />

              <span>
                {loading
                  ? "Checking"
                  : isOnline
                  ? "Live"
                  : "Unavailable"}
              </span>

            </div>

          </div>


          {/* REAL NASA FIRMS MAP */}

          <div className="tx-live-map-container">

            <IndiaFocusedMap
              height="100%"
            />

          </div>

        </section>


        {/* ==================================================
            BOTTOM INFORMATION
        ================================================== */}

        <section className="tx-live-map-footer">

          <div>

            <strong>
              NASA FIRMS
            </strong>

            <span>
              Fire Information for Resource
              Management System
            </span>

          </div>


          <div className="tx-live-map-footer-right">

            {detectionCount !== null ? (
              <>
                {detectionCount.toLocaleString()}{" "}
                thermal detections returned by
                the monitoring service.
              </>
            ) : (
              <>
                Detection count unavailable from
                the monitoring service.
              </>
            )}

          </div>

        </section>

      </div>

    </main>
  );
};

export default LiveMap;