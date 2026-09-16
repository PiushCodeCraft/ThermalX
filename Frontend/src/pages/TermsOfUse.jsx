import React from "react";
import { Link } from "react-router-dom";

import "./SupportPages.css";

function TermsOfUse() {
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

        <article className="support-card support-document">

          <div className="support-breadcrumb">
            Home / Support / Terms of Use
          </div>

          <h1>
            Terms of Use
          </h1>

          <div className="support-red-line" />

          <div className="support-updated">
            Last updated: September 16, 2026
          </div>

          <p>
            By accessing and using THERMAL X, you agree to
            comply with the following terms and conditions
            governing use of the platform and its services.
          </p>


          <h2>
            1. Use of Platform
          </h2>

          <p>
            THERMAL X is intended to provide satellite-based
            thermal monitoring, analysis, visualization and
            investigation support. Users agree to use the
            platform responsibly and for lawful purposes.
          </p>


          <h2>
            2. Data Sources
          </h2>

          <p>
            THERMAL X uses satellite thermal data from NASA
            FIRMS and related geospatial sources. Data presented
            through the platform should be interpreted according
            to the limitations of the underlying data sources.
          </p>


          <h2>
            3. Intellectual Property
          </h2>

          <p>
            THERMAL X branding, interface elements, software
            components and original analytical materials are
            protected by applicable intellectual property laws.
          </p>


          <h2>
            4. Information Accuracy
          </h2>

          <p>
            Satellite observations and analytical outputs may
            contain limitations, delays, uncertainty or errors.
            Platform information should therefore be used as
            an analytical aid and not as the sole basis for
            critical decisions.
          </p>


          <h2>
            5. Changes to Terms
          </h2>

          <p>
            THERMAL X may update these Terms of Use from time
            to time. Continued use of the platform following
            changes indicates acceptance of the updated terms.
          </p>


          <h2>
            6. Contact
          </h2>

          <p>
            For questions regarding these terms, please contact
            the THERMAL X administrative team.
          </p>

        </article>

      </section>

    </main>
  );
}

export default TermsOfUse;