import React from "react";
import {
  Database,
  Satellite,
  BrainCircuit,
  Server,
  RefreshCw,
  Activity,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import "./System.css";

const System = () => {
  const services = [
    {
      name: "NASA FIRMS Data Service",
      description: "Satellite thermal data ingestion",
      status: "Online",
      icon: Satellite,
    },
    {
      name: "AI Detection Engine",
      description: "Thermal fire-risk classification",
      status: "Active",
      icon: BrainCircuit,
    },
    {
      name: "PostgreSQL Database",
      description: "Incident and detection storage",
      status: "Connected",
      icon: Database,
    },
    {
      name: "Backend API",
      description: "THERMAL-X application services",
      status: "Online",
      icon: Server,
    },
  ];

  const systemMetrics = [
    {
      label: "Data Collection",
      value: "Running",
      icon: Satellite,
    },
    {
      label: "AI Processing",
      value: "Ready",
      icon: BrainCircuit,
    },
    {
      label: "Database",
      value: "Connected",
      icon: Database,
    },
    {
      label: "System Uptime",
      value: "99.8%",
      icon: Activity,
    },
  ];

  return (
    <div className="tx-system">

      {/* HEADER */}

      <header className="tx-system-header">
        <div>
          <span className="tx-system-eyebrow">
            THERMAL-X / ADMINISTRATION
          </span>

          <h1>System</h1>

          <p>
            Monitor THERMAL-X services, data pipelines
            and system health.
          </p>
        </div>

        <button
          type="button"
          className="tx-system-refresh"
        >
          <RefreshCw size={15} />
          REFRESH STATUS
        </button>
      </header>


      {/* SYSTEM HEALTH */}

      <section className="tx-system-health">

        <div className="tx-system-health-indicator">
          <span className="tx-system-health-dot" />
          ALL SYSTEMS OPERATIONAL
        </div>

        <span className="tx-system-last-update">
          <Clock3 size={13} />
          Last checked: Just now
        </span>

      </section>


      {/* METRICS */}

      <section className="tx-system-metrics">

        {systemMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className="tx-system-metric-card"
              key={metric.label}
            >
              <div className="tx-system-metric-icon">
                <Icon size={19} />
              </div>

              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            </article>
          );
        })}

      </section>


      {/* SERVICES */}

      <section className="tx-system-services-card">

        <div className="tx-system-card-header">

          <div>
            <span className="tx-system-card-eyebrow">
              SERVICES
            </span>

            <h2>System Services</h2>
          </div>

          <span className="tx-system-online-badge">
            4 SERVICES
          </span>

        </div>


        <div className="tx-system-services">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                className="tx-system-service"
                key={service.name}
              >

                <div className="tx-system-service-icon">
                  <Icon size={20} />
                </div>

                <div className="tx-system-service-info">

                  <strong>
                    {service.name}
                  </strong>

                  <span>
                    {service.description}
                  </span>

                </div>

                <div className="tx-system-service-status">

                  <span />

                  {service.status}

                </div>

              </article>
            );
          })}

        </div>

      </section>


      {/* CONFIGURATION */}

      <section className="tx-system-config-card">

        <div className="tx-system-card-header">

          <div>
            <span className="tx-system-card-eyebrow">
              CONFIGURATION
            </span>

            <h2>System Configuration</h2>
          </div>

          <ShieldCheck size={19} />

        </div>


        <div className="tx-system-config-grid">

          <div className="tx-system-config-item">
            <span>Thermal Data Source</span>
            <strong>NASA FIRMS</strong>
          </div>

          <div className="tx-system-config-item">
            <span>Satellite Product</span>
            <strong>VIIRS NOAA-21</strong>
          </div>

          <div className="tx-system-config-item">
            <span>Collection Interval</span>
            <strong>15 Minutes</strong>
          </div>

          <div className="tx-system-config-item">
            <span>Database Driver</span>
            <strong>PostgreSQL / pg8000</strong>
          </div>

          <div className="tx-system-config-item">
            <span>AI Processing</span>
            <strong>Enabled</strong>
          </div>

          <div className="tx-system-config-item">
            <span>Alert Processing</span>
            <strong>Enabled</strong>
          </div>

        </div>

      </section>


      {/* SYSTEM NOTE */}

      <div className="tx-system-note">
        <strong>System information</strong>

        <span>
          Configuration values shown here are
          frontend placeholders and will be populated
          from the THERMAL-X backend.
        </span>
      </div>

    </div>
  );
};

export default System;