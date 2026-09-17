import React, { useState } from "react";
import {
  X,
  Flame,
  Factory,
  GraduationCap,
  HeartPulse,
  ShieldAlert,
  Home,
  Trees,
  Building,
  Navigation,
  RefreshCw,
  AlertTriangle,
  Info,
  MapPin,
  Compass,
} from "lucide-react";
import "./ThermalSurroundingsPanel.css";

const getCategoryIcon = (category, size = 15) => {
  switch (category) {
    case "industrial":
      return <Factory size={size} />;
    case "education":
      return <GraduationCap size={size} />;
    case "healthcare":
      return <HeartPulse size={size} />;
    case "emergency":
      return <ShieldAlert size={size} />;
    case "residential":
      return <Home size={size} />;
    case "environment":
      return <Trees size={size} />;
    case "commercial":
      return <Building size={size} />;
    default:
      return <MapPin size={size} />;
  }
};

const getRiskBadgeClass = (level) => {
  switch (level) {
    case "CRITICAL":
      return "tx-risk-critical";
    case "HIGH":
      return "tx-risk-high";
    case "MODERATE":
      return "tx-risk-moderate";
    default:
      return "tx-risk-low";
  }
};

const ThermalSurroundingsPanel = ({
  selectedPoint,
  surroundingsData,
  loading,
  error,
  onClose,
  onRefresh,
  onFocusItem,
}) => {
  const [activeTab, setActiveTab] = useState("all");

  if (!selectedPoint) return null;

  const counts = surroundingsData?.counts || {
    total: 0,
    industrial: 0,
    education: 0,
    healthcare: 0,
    emergency: 0,
    residential: 0,
    environment: 0,
  };

  const risk = surroundingsData?.riskAssessment || {
    level: "LOW",
    score: 20,
    summary: "Scanning 5km surrounding area...",
  };

  const allItems = surroundingsData?.surroundings || [];

  const filteredItems =
    activeTab === "all"
      ? allItems
      : allItems.filter((item) => item.category === activeTab);

  const tabs = [
    { id: "all", label: "All POIs", count: counts.total },
    { id: "industrial", label: "Industrial", count: counts.industrial, icon: Factory },
    { id: "education", label: "Schools", count: counts.education, icon: GraduationCap },
    { id: "healthcare", label: "Healthcare", count: counts.healthcare, icon: HeartPulse },
    { id: "residential", label: "Residential", count: counts.residential, icon: Home },
    { id: "emergency", label: "Emergency", count: counts.emergency, icon: ShieldAlert },
    { id: "environment", label: "Nature", count: counts.environment, icon: Trees },
  ].filter((t) => t.id === "all" || t.count > 0);

  return (
    <aside className="tx-surroundings-panel">
      {/* PANEL HEADER */}
      <div className="tx-panel-header">
        <div className="tx-panel-header-title">
          <div className="tx-panel-fire-badge">
            <Flame size={16} />
          </div>
          <div>
            <h3>Thermal Hotspot Analysis</h3>
            <p className="tx-panel-location">
              <MapPin size={11} />
              <span>
                {surroundingsData?.center?.locationName ||
                  `${selectedPoint.latitude.toFixed(4)}° N, ${selectedPoint.longitude.toFixed(4)}° E`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="tx-panel-close-btn"
          onClick={onClose}
          aria-label="Close panel"
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* HOTSPOT METRICS */}
      <div className="tx-panel-metrics">
        <div className="tx-metric-card">
          <span className="tx-metric-label">FIRE RADIATIVE POWER</span>
          <strong className="tx-metric-val tx-val-frp">
            {selectedPoint.frp ? `${selectedPoint.frp} MW` : "N/A"}
          </strong>
        </div>

        <div className="tx-metric-card">
          <span className="tx-metric-label">BRIGHTNESS</span>
          <strong className="tx-metric-val">
            {selectedPoint.brightness ? `${selectedPoint.brightness} K` : "N/A"}
          </strong>
        </div>

        <div className="tx-metric-card">
          <span className="tx-metric-label">COORDINATES</span>
          <span className="tx-metric-coords">
            {selectedPoint.latitude.toFixed(4)}, {selectedPoint.longitude.toFixed(4)}
          </span>
        </div>

        <div className="tx-metric-card">
          <span className="tx-metric-label">DETECTION / SAT</span>
          <span className="tx-metric-sub">
            {selectedPoint.acq_date
              ? `${selectedPoint.acq_date} ${selectedPoint.acq_time || ""}`
              : "Live Satellite"}
          </span>
        </div>
      </div>

      {/* RISK ASSESSMENT BANNER */}
      <div className={`tx-risk-banner ${getRiskBadgeClass(risk.level)}`}>
        <div className="tx-risk-header">
          <div className="tx-risk-title-wrap">
            <AlertTriangle size={15} />
            <span className="tx-risk-badge-text">
              {risk.level} HAZARD PROXIMITY
            </span>
          </div>
          <span className="tx-risk-score">{risk.score}/100</span>
        </div>

        <p className="tx-risk-summary">{risk.summary}</p>
      </div>

      {/* RADIUS BUFFER INFO */}
      <div className="tx-radius-header">
        <div className="tx-radius-title">
          <Compass size={14} />
          <strong>5 KM Surrounding Infrastructure</strong>
          <span className="tx-total-pill">{counts.total} found</span>
        </div>

        {onRefresh && (
          <button
            type="button"
            className="tx-panel-refresh-btn"
            onClick={onRefresh}
            title="Refresh surrounding data"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? "tx-spin" : ""} />
            Refresh
          </button>
        )}
      </div>

      {/* CATEGORY TABS */}
      <div className="tx-category-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tx-category-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {Icon && <Icon size={12} />}
              <span>{tab.label}</span>
              <span className="tx-tab-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* LIST OF POIS */}
      <div className="tx-surroundings-list">
        {loading && (
          <div className="tx-panel-loading">
            <RefreshCw size={24} className="tx-spin" />
            <p>Scanning OpenStreetMap within 5km radius...</p>
            <span>Querying industrial plants, schools, and hospitals</span>
          </div>
        )}

        {!loading && error && (
          <div className="tx-panel-error">
            <Info size={18} />
            <p>{error}</p>
            {onRefresh && (
              <button type="button" onClick={onRefresh}>
                Try Again
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="tx-panel-empty">
            <Info size={20} />
            <p>No tagged infrastructure found for this category within 5km.</p>
            <small>The thermal point may be located in open terrain, rural, or unmapped forestry.</small>
          </div>
        )}

        {!loading &&
          !error &&
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="tx-surrounding-card"
              onClick={() => onFocusItem && onFocusItem(item)}
              title="Click to view on map"
            >
              <div
                className="tx-item-icon"
                style={{
                  backgroundColor: `${item.badgeColor}18`,
                  color: item.badgeColor,
                }}
              >
                {getCategoryIcon(item.category, 16)}
              </div>

              <div className="tx-item-content">
                <div className="tx-item-top">
                  <span className="tx-item-name">{item.name}</span>
                </div>
                <div className="tx-item-sub">
                  <span
                    className="tx-item-category-pill"
                    style={{
                      borderColor: `${item.badgeColor}40`,
                      color: item.badgeColor,
                    }}
                  >
                    {item.type || item.categoryLabel}
                  </span>
                  <span className="tx-item-coords">
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              <div className="tx-item-dist-wrap">
                <span className="tx-item-dist">
                  <Navigation size={11} />
                  {item.distanceKm} km
                </span>
                <span className="tx-dist-meters">{item.distanceMeters} m</span>
              </div>
            </div>
          ))}
      </div>

      {/* FOOTER */}
      <div className="tx-panel-footer">
        <span>Data verified via OpenStreetMap Overpass API</span>
        <span>Radius: 5.0 km</span>
      </div>
    </aside>
  );
};

export default ThermalSurroundingsPanel;
