import React from "react";
import {
  Activity,
  Flame,
  MapPin,
  Satellite,
  RefreshCw,
} from "lucide-react";

import IndiaFocusedMap from "../../components/map/IndiaFocusedMap";

import "./AdminLiveMap.css";

const AdminLiveMap = () => {
  return (
    <div className="tx-admin-live-map">

      {/* HEADER */}
      <header className="tx-admin-live-map-header">
        <div>
          <span className="tx-admin-live-map-eyebrow">
            THERMAL-X / ADMINISTRATION / LIVE MONITORING
          </span>

          <h1>Live Thermal Map</h1>

          <p>
            Real-time satellite thermal activity and
            fire detection monitoring.
          </p>
        </div>

        <div className="tx-admin-live-map-status">
          <span className="tx-admin-live-map-status-dot" />
          NASA FIRMS ONLINE
        </div>
      </header>


      {/* STATISTICS */}
      <section className="tx-admin-live-map-stats">

        <article className="tx-admin-live-map-stat">
          <div className="tx-admin-live-map-stat-icon">
            <Flame size={18} />
          </div>

          <div>
            <span>THERMAL DETECTIONS</span>
            <strong>186</strong>
          </div>
        </article>


        <article className="tx-admin-live-map-stat">
          <div className="tx-admin-live-map-stat-icon">
            <Activity size={18} />
          </div>

          <div>
            <span>ACTIVE INCIDENTS</span>
            <strong>24</strong>
          </div>
        </article>


        <article className="tx-admin-live-map-stat">
          <div className="tx-admin-live-map-stat-icon">
            <Satellite size={18} />
          </div>

          <div>
            <span>SATELLITE SOURCE</span>
            <strong>VIIRS NOAA-21</strong>
          </div>
        </article>


        <article className="tx-admin-live-map-stat">
          <div className="tx-admin-live-map-stat-icon">
            <MapPin size={18} />
          </div>

          <div>
            <span>MONITORED REGION</span>
            <strong>INDIA</strong>
          </div>
        </article>

      </section>


      {/* MAP CARD */}
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

            <span className="tx-admin-live-map-live-dot" />

            LIVE

          </div>

        </div>


        {/* SAME MAP USED BY LIVE MAP PAGE */}
        <div className="tx-admin-live-map-wrapper">
          <IndiaFocusedMap />
        </div>

      </section>


      {/* INFORMATION */}
      <section className="tx-admin-live-map-information">

        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">
            <Satellite size={16} />
          </div>

          <div>
            <span>DATA SOURCE</span>
            <strong>NASA FIRMS</strong>
          </div>

        </div>


        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">
            <Flame size={16} />
          </div>

          <div>
            <span>THERMAL PRODUCT</span>
            <strong>VIIRS NOAA-21</strong>
          </div>

        </div>


        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">
            <RefreshCw size={16} />
          </div>

          <div>
            <span>MONITORING MODE</span>
            <strong>NEAR REAL-TIME</strong>
          </div>

        </div>


        <div className="tx-admin-live-map-info-card">

          <div className="tx-admin-live-map-info-icon">
            <MapPin size={16} />
          </div>

          <div>
            <span>REGION</span>
            <strong>INDIA</strong>
          </div>

        </div>

      </section>

    </div>
  );
};

export default AdminLiveMap;