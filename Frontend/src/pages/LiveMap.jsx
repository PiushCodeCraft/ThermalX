import React from "react";
import { Radio, RefreshCw } from "lucide-react";

import IndiaFocusedMap from "../components/map/IndiaFocusedMap";

import "./LiveMap.css";

const LiveMap = ({ role = "basic" }) => {
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

            <h1>
              Live Thermal Activity Map
            </h1>

            <p>
              Real-time NASA FIRMS thermal activity
              across monitored regions of India.
            </p>

          </div>

          <div className="tx-live-map-header-right">

            <div className="tx-live-map-live-status">

              <span className="tx-live-dot" />

              <div>
                <strong>
                  Live Data
                </strong>

                <small>
                  NASA FIRMS
                </small>
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
                Live thermal detections from NASA FIRMS
                VIIRS NOAA-21.
              </p>

            </div>

            <div className="tx-live-map-card-status">

              <span className="tx-live-dot" />

              <span>
                Live
              </span>

            </div>

          </div>

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
              Fire Information for Resource Management System
            </span>
          </div>

          <div className="tx-live-map-footer-right">
            Data represents satellite-based thermal
            anomaly detections.
          </div>

        </section>

      </div>

    </main>
  );
};

export default LiveMap;