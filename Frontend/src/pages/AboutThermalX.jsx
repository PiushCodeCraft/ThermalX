import React from "react";
import { Link } from "react-router-dom";
import {
  Satellite,
  BrainCircuit,
  ShieldCheck,
  Leaf,
} from "lucide-react";

import "./SupportPages.css";

function AboutThermalX() {
  return (
    <main className="support-page">

      <video
        className="support-background-video"
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

      <div className="support-video-overlay" />

      {/* NAVBAR */}

      <header className="support-navbar">

        <Link
          to="/"
          className="support-logo"
          aria-label="THERMAL X Home"
        >
          <img
            src="/assets/thermal-x-logo.png"
            alt="THERMAL X"
          />
        </Link>

        <nav className="support-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/live-map">
            Live Map
          </Link>

          <Link to="/alerts">
            Alerts
          </Link>

          <div className="support-dropdown">

            <button type="button">
              Support
              <span>⌄</span>
            </button>

            <div className="support-dropdown-menu">

              <Link to="/about">
                About THERMAL X
              </Link>

              <Link to="/privacy-policy">
                Privacy Policy
              </Link>

              <Link to="/terms-of-use">
                Terms of Use
              </Link>

            </div>

          </div>

        </nav>

      </header>


      {/* CONTENT */}

      <section className="support-content">

        <div className="support-card">

          <div className="support-breadcrumb">
            Home / Support / About
          </div>

          <h1>
            About THERMAL X
          </h1>

          <div className="support-red-line" />

          <p>
            THERMAL X is a satellite-based thermal monitoring
            and analysis platform built to detect, understand,
            and investigate significant thermal events.
          </p>

          <p>
            The platform combines satellite thermal observations,
            geospatial intelligence, persistence analysis and
            AI-powered evidence fusion to support the detection
            and investigation of thermal activity.
          </p>


          <div className="support-features">

            <div className="support-feature">

              <div className="support-feature-icon">
                <Satellite size={22} />
              </div>

              <h3>
                Satellite Data
              </h3>

              <span>
                NASA FIRMS / VIIRS
              </span>

            </div>


            <div className="support-feature">

              <div className="support-feature-icon">
                <BrainCircuit size={22} />
              </div>

              <h3>
                AI Analysis
              </h3>

              <span>
                Intelligent Insights
              </span>

            </div>


            <div className="support-feature">

              <div className="support-feature-icon">
                <ShieldCheck size={22} />
              </div>

              <h3>
                Public Safety
              </h3>

              <span>
                Faster Response
              </span>

            </div>


            <div className="support-feature">

              <div className="support-feature-icon">
                <Leaf size={22} />
              </div>

              <h3>
                Sustainable Future
              </h3>

              <span>
                A Safer Planet
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default AboutThermalX;