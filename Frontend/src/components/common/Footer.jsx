import React from "react";
import { Link } from "react-router-dom";
import {
  Satellite,
  Map,
  BarChart3,
  ShieldCheck,
  Mail,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  return (
    <>
      {/* =====================================================
          THERMAL X FOOTER STYLES
      ====================================================== */}

      <style>{`
        /* =====================================================
           MAIN FOOTER
        ====================================================== */

        .thermal-footer {
          width: 100%;
          background: #ffffff;
          color: #0f3550;
          border-top: 1px solid #e2e8f0;
          font-family: "Inter", sans-serif;
        }


        /* =====================================================
           MAIN FOOTER CONTAINER
        ====================================================== */

        .thermal-footer-container {
          width: min(1250px, calc(100% - 48px));

          margin: 0 auto;

          padding: 55px 0 45px;

          display: grid;

          grid-template-columns:
            2fr
            1fr
            1fr
            1fr;

          gap: 55px;
        }


        /* =====================================================
           BRAND SECTION
        ====================================================== */

        .thermal-footer-brand {
          max-width: 360px;
        }

        .thermal-footer-logo-link {
          display: inline-flex;

          align-items: center;

          text-decoration: none;
        }

        .thermal-footer-logo {
          width: 185px;

          height: auto;

          display: block;

          object-fit: contain;
        }

        .thermal-footer-description {
          margin: 20px 0 0;

          color: #607d96;

          font-size: 13px;

          line-height: 1.75;

          font-weight: 400;
        }

        .thermal-footer-tagline {
          margin-top: 20px;

          color: #e63232;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.2em;

          line-height: 1.5;
        }


        /* =====================================================
           FOOTER COLUMNS
        ====================================================== */

        .thermal-footer-column {
          display: flex;

          flex-direction: column;

          align-items: flex-start;
        }

        .thermal-footer-column h3 {
          margin: 5px 0 20px;

          color: #0f3550;

          font-size: 10px;

          font-weight: 800;

          letter-spacing: 0.2em;

          text-transform: uppercase;
        }


        /* =====================================================
           FOOTER LINKS
        ====================================================== */

        .thermal-footer-column a {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 13px;

          color: #607d96;

          text-decoration: none;

          font-size: 12px;

          line-height: 1.4;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .thermal-footer-column a svg {
          width: 14px;

          height: 14px;

          flex-shrink: 0;

          color: #607d96;

          opacity: 0.9;
        }

        .thermal-footer-column a:hover {
          color: #0f3550;

          transform: translateX(2px);
        }

        .thermal-footer-column a:hover svg {
          color: #0f3550;
        }


        /* =====================================================
           BOTTOM BAR
        ====================================================== */

        .thermal-footer-bottom {
          border-top: 1px solid #e2e8f0;

          background: #ffffff;
        }

        .thermal-footer-bottom-container {
          width: min(1250px, calc(100% - 48px));

          min-height: 58px;

          margin: 0 auto;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          color: #718697;

          font-size: 9px;

          font-weight: 600;

          letter-spacing: 0.05em;
        }


        /* =====================================================
           SYSTEM STATUS
        ====================================================== */

        .thermal-footer-system {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #718697;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 0.15em;
        }

        .thermal-footer-status-dot {
          width: 7px;

          height: 7px;

          border-radius: 50%;

          background: #2563eb;

          box-shadow:
            0 0 8px rgba(37, 99, 235, 0.35);
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {

          .thermal-footer-container {
            grid-template-columns:
              1.5fr
              1fr
              1fr;

            gap: 35px;
          }

          .thermal-footer-brand {
            grid-column: span 3;

            max-width: 600px;
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 650px) {

          .thermal-footer-container {
            width: calc(100% - 36px);

            padding: 40px 0 35px;

            grid-template-columns:
              1fr 1fr;

            gap: 32px 25px;
          }

          .thermal-footer-brand {
            grid-column: span 2;

            max-width: none;
          }

          .thermal-footer-logo {
            width: 165px;
          }

          .thermal-footer-description {
            max-width: 450px;

            font-size: 12px;
          }

          .thermal-footer-bottom-container {
            width: calc(100% - 36px);

            padding: 18px 0;

            flex-direction: column;

            align-items: flex-start;

            gap: 12px;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 420px) {

          .thermal-footer-container {
            width: calc(100% - 30px);

            grid-template-columns: 1fr;

            gap: 28px;
          }

          .thermal-footer-brand {
            grid-column: span 1;
          }

          .thermal-footer-logo {
            width: 150px;
          }

          .thermal-footer-description {
            font-size: 11px;

            line-height: 1.7;
          }

          .thermal-footer-tagline {
            font-size: 7px;

            line-height: 1.6;
          }

          .thermal-footer-column h3 {
            margin-bottom: 15px;
          }

          .thermal-footer-column a {
            font-size: 11px;
          }

          .thermal-footer-bottom-container {
            width: calc(100% - 30px);

            font-size: 8px;
          }

          .thermal-footer-system {
            font-size: 7px;

            letter-spacing: 0.1em;
          }

        }


        /* =====================================================
           EXTRA SMALL MOBILE
        ====================================================== */

        @media (max-width: 350px) {

          .thermal-footer-container {
            width: calc(100% - 24px);

            padding-top: 32px;

            padding-bottom: 28px;
          }

          .thermal-footer-logo {
            width: 140px;
          }

          .thermal-footer-description {
            font-size: 10px;
          }

          .thermal-footer-column a {
            font-size: 10px;
          }

          .thermal-footer-bottom-container {
            width: calc(100% - 24px);
          }

        }

      `}</style>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="thermal-footer">

        {/* ===================================================
            MAIN FOOTER
        ==================================================== */}

        <div className="thermal-footer-container">


          {/* =================================================
              BRAND
          ================================================== */}

          <div className="thermal-footer-brand">

            <Link
              to="/"
              className="thermal-footer-logo-link"
              aria-label="THERMAL X Home"
            >

              <img
                src="/assets/thermal-x-logo.png"
                alt="THERMAL X"
                className="thermal-footer-logo"
              />

            </Link>


            <p className="thermal-footer-description">
              Satellite thermal intelligence for detecting,
              understanding and investigating significant
              thermal events.
            </p>


            <div className="thermal-footer-tagline">
              SEE THE HEAT. UNDERSTAND THE CHANGE.
            </div>

          </div>


          {/* =================================================
              PLATFORM
          ================================================== */}

          <div className="thermal-footer-column">

            <h3>
              PLATFORM
            </h3>

            <Link to="/">
              <BarChart3 />
              Dashboard
            </Link>

            <Link to="/incident-map">
              <Map />
              Incident Map
            </Link>

            <Link to="/satellite-feeds">
              <Satellite />
              Satellite Feeds
            </Link>

            <Link to="/analytics">
              <BarChart3 />
              Analytics
            </Link>

          </div>


          {/* =================================================
              RESOURCES
          ================================================== */}

          <div className="thermal-footer-column">

            <h3>
              RESOURCES
            </h3>

            <a href="#thermal-data">
              <Satellite />
              Thermal Data
            </a>

            <a href="#viirs">
              <Satellite />
              VIIRS Observations
            </a>

            <a href="#documentation">
              <ExternalLink />
              Documentation
            </a>

            <a href="#methodology">
              <ShieldCheck />
              Methodology
            </a>

          </div>


          {/* =================================================
              SUPPORT
          ================================================== */}

          <div className="thermal-footer-column">

            <h3>
              SUPPORT
            </h3>

            <a href="mailto:support@thermalx.in">
              <Mail />
              Contact Support
            </a>

            <a href="#about">
              <ShieldCheck />
              About THERMAL X
            </a>

            <a href="#privacy">
              Privacy Policy
            </a>

            <a href="#terms">
              Terms of Use
            </a>

          </div>

        </div>


        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div className="thermal-footer-bottom">

          <div className="thermal-footer-bottom-container">

            <span>
              © {new Date().getFullYear()} THERMAL X.
              All rights reserved.
            </span>


            <span className="thermal-footer-system">

              <span className="thermal-footer-status-dot" />

              SATELLITE INTELLIGENCE PLATFORM

            </span>

          </div>

        </div>

      </footer>
    </>
  );
};

export default Footer;