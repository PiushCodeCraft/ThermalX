import React from "react";
import { Link } from "react-router-dom";

import "./SupportPages.css";

function PrivacyPolicy() {
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
            Home / Support / Privacy Policy
          </div>

          <h1>
            Privacy Policy
          </h1>

          <div className="support-red-line" />

          <div className="support-updated">
            Last updated: September 16, 2026
          </div>

          <p>
            THERMAL X is committed to protecting user privacy
            and maintaining transparency regarding information
            handled through the platform.
          </p>


          <h2>
            1. Information We Collect
          </h2>

          <p>
            THERMAL X may collect information provided by users
            when accessing platform services, submitting feedback,
            or requesting access to platform functionality.
          </p>


          <h2>
            2. How We Use Information
          </h2>

          <p>
            Information may be used to provide platform access,
            improve functionality, respond to user requests,
            and communicate important platform updates.
          </p>


          <h2>
            3. Data Security
          </h2>

          <p>
            THERMAL X uses appropriate technical and
            organizational measures intended to protect
            information against unauthorized access,
            disclosure, alteration, or misuse.
          </p>


          <h2>
            4. Satellite Data
          </h2>

          <p>
            THERMAL X uses satellite thermal observations
            provided through NASA FIRMS. Satellite observations
            remain subject to the policies and terms of their
            respective data providers.
          </p>


          <h2>
            5. Third-Party Services
          </h2>

          <p>
            Certain platform functionality may rely on external
            services and data providers. Their respective privacy
            policies and terms may also apply.
          </p>


          <h2>
            6. Contact
          </h2>

          <p>
            For privacy-related questions or requests, please
            contact the THERMAL X administrative team.
          </p>

        </article>

      </section>

    </main>
  );
}

export default PrivacyPolicy;