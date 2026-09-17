import React, { useState, useRef, useCallback } from "react";
import { Radio, RefreshCw, Compass, ShieldAlert } from "lucide-react";

import IndiaFocusedMap from "../components/map/IndiaFocusedMap";
import ThermalSurroundingsPanel from "../components/map/ThermalSurroundingsPanel";

import "./LiveMap.css";

const LiveMap = ({ role = "basic" }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [surroundingsData, setSurroundingsData] = useState(null);
  const [surroundingsLoading, setSurroundingsLoading] = useState(false);
  const [surroundingsError, setSurroundingsError] = useState(null);

  const focusMapHandlerRef = useRef(null);

  /* =========================================================
     FETCH 5KM SURROUNDINGS DATA
  ========================================================= */

  const fetchSurroundings = useCallback(async (lat, lon) => {
    if (lat === undefined || lon === undefined) return;

    setSurroundingsLoading(true);
    setSurroundingsError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/fire/surroundings?lat=${lat}&lon=${lon}&radius=5000`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSurroundingsData(result);
      } else {
        setSurroundingsError(result.message || "Failed to query 5km surroundings.");
      }
    } catch (err) {
      console.error("Surroundings query error:", err.message);
      setSurroundingsError("Could not connect to surroundings service.");
    } finally {
      setSurroundingsLoading(false);
    }
  }, []);

  /* =========================================================
     HOTSPOT SELECTION HANDLER
  ========================================================= */

  const handleSelectPoint = useCallback(
    (point) => {
      setSelectedPoint(point);
      fetchSurroundings(point.latitude, point.longitude);
    },
    [fetchSurroundings]
  );

  const handleClosePanel = useCallback(() => {
    setSelectedPoint(null);
    setSurroundingsData(null);
    setSurroundingsError(null);
  }, []);

  const handleRefreshSurroundings = useCallback(() => {
    if (selectedPoint) {
      fetchSurroundings(selectedPoint.latitude, selectedPoint.longitude);
    }
  }, [selectedPoint, fetchSurroundings]);

  const handleFocusItem = useCallback((item) => {
    if (focusMapHandlerRef.current) {
      focusMapHandlerRef.current(item);
    }
  }, []);

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
          <source src="/earth-space.mp4" type="video/mp4" />
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

            <h1>Live Thermal Activity Map</h1>

            <p>
              Real-time NASA FIRMS & MongoDB thermal detections with 5km
              infrastructure vulnerability assessment.
            </p>
          </div>

          <div className="tx-live-map-header-right">
            <div className="tx-live-map-live-status">
              <span className="tx-live-dot" />

              <div>
                <strong>Live Monitoring</strong>
                <small>NASA FIRMS & 5km Overpass</small>
              </div>
            </div>

            <button
              type="button"
              className="tx-live-map-refresh"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </section>

        {/* ==================================================
            MAP INFORMATION BAR
        ================================================== */}

        <section className="tx-live-map-info">
          <div className="tx-live-map-info-item">
            <div className="tx-live-map-info-icon">
              <Radio size={16} />
            </div>

            <div>
              <span>DATA SOURCE</span>
              <strong>NASA FIRMS & OSM</strong>
            </div>
          </div>

          <div className="tx-live-map-info-divider" />

          <div className="tx-live-map-info-item">
            <div>
              <span>SATELLITE</span>
              <strong>VIIRS NOAA-21</strong>
            </div>
          </div>

          <div className="tx-live-map-info-divider" />

          <div className="tx-live-map-info-item">
            <div>
              <span>SURROUNDING RADIUS</span>
              <strong style={{ color: "#ea580c" }}>5.0 KM Geodesic Zone</strong>
            </div>
          </div>

          <div className="tx-live-map-info-divider" />

          <div className="tx-live-map-info-item">
            <div>
              <span>VULNERABILITY POIS</span>
              <strong>Industrial • Schools • Hospitals</strong>
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
                <span className="tx-live-map-fire-icon">🔥</span>
                <h2>Thermal Activity & 5km Surroundings — India</h2>
              </div>

              <p>
                Click any thermal point to evaluate surrounding industrial
                facilities, schools, hospitals, and residential areas within 5km.
              </p>
            </div>

            <div className="tx-live-map-card-status">
              <span className="tx-live-dot" />
              <span>Live Interactive</span>
            </div>
          </div>

          <div className="tx-live-map-container">
            <IndiaFocusedMap
              height="100%"
              selectedPoint={selectedPoint}
              surroundingsData={surroundingsData}
              onSelectPoint={handleSelectPoint}
              setFocusHandler={(fn) => {
                focusMapHandlerRef.current = fn;
              }}
            />

            {/* 5KM SURROUNDINGS SLIDE-OUT INSPECTOR */}
            {selectedPoint && (
              <ThermalSurroundingsPanel
                selectedPoint={selectedPoint}
                surroundingsData={surroundingsData}
                loading={surroundingsLoading}
                error={surroundingsError}
                onClose={handleClosePanel}
                onRefresh={handleRefreshSurroundings}
                onFocusItem={handleFocusItem}
              />
            )}
          </div>
        </section>

        {/* ==================================================
            BOTTOM INFORMATION
        ================================================== */}

        <section className="tx-live-map-footer">
          <div>
            <strong>NASA FIRMS & OpenStreetMap</strong>
            <span>
              Fire Information for Resource Management System & OpenStreetMap
              Overpass API
            </span>
          </div>

          <div className="tx-live-map-footer-right">
            5km Geodesic buffer calculated in real time around each thermal anomaly.
          </div>
        </section>
      </div>
    </main>
  );
};

export default LiveMap;