import React from "react";
import { Link } from "react-router-dom";
import {
  Satellite,
  Map,
  BarChart3,
  ShieldCheck,
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

          padding: 60px 0 50px;

          display: grid;

          grid-template-columns:
            2fr
            1fr
            1fr
            1fr;

          gap: 65px;

          align-items: start;
        }


        /* =====================================================
           BRAND SECTION
        ====================================================== */

        .thermal-footer-brand {
          max-width: 380px;
        }

        .thermal-footer-logo-link {
          display: inline-flex;

          align-items: center;

          text-decoration: none;
        }

        .thermal-footer-logo {
          width: 205px;

          height: auto;

          display: block;

          object-fit: contain;
        }

        .thermal-footer-description {
          margin: 22px 0 0;

          color: #607d96;

          font-size: 15px;

          line-height: 1.75;

          font-weight: 400;

          max-width: 370px;
        }

        .thermal-footer-tagline {
          margin-top: 22px;

          color: #e63232;

          font-size: 9px;

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

          padding-top: 4px;
        }


        /* =====================================================
           COLUMN HEADINGS
        ====================================================== */

        .thermal-footer-column h3 {
          margin: 0 0 25px;

          color: #0f3550;

          font-size: 14px;

          font-weight: 800;

          letter-spacing: 0.18em;

          line-height: 1.3;

          text-transform: uppercase;
        }


        /* =====================================================
           FOOTER LINKS
        ====================================================== */

        .thermal-footer-column a {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 17px;

          color: #607d96;

          text-decoration: none;

          font-size: 15px;

          line-height: 1.45;

          font-weight: 400;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .thermal-footer-column a svg {
          width: 16px;

          height: 16px;

          flex-shrink: 0;

          color: #607d96;

          opacity: 0.9;
        }

        .thermal-footer-column a:hover {
          color: #0f3550;

          transform: translateX(3px);
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

          min-height: 62px;

          margin: 0 auto;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          color: #718697;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 0.05em;
        }


        /* =====================================================
           SYSTEM STATUS
        ====================================================== */

        .thermal-footer-system {
          display: flex;

          align-items: center;

          gap: 9px;

          color: #718697;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 0.15em;
        }

        .thermal-footer-status-dot {
          width: 8px;

          height: 8px;

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

            gap: 40px;
          }

          .thermal-footer-brand {
            grid-column: span 3;

            max-width: 600px;
          }

        }


        /* =====================================================
          MOBILE FOOTER
        ===================================================== */

        @media (max-width: 650px) {

          .thermal-footer-container {
            width: calc(100% - 30px);

            margin: 0 auto;

            padding: 38px 0 32px;

            display: grid;

            grid-template-columns: 1fr 1fr;

            column-gap: 25px;

            row-gap: 30px;

            align-items: start;
          }


          /* =================================================
            BRAND
          ================================================= */

          .thermal-footer-brand {
            grid-column: 1 / -1;

            max-width: 100%;
          }

          .thermal-footer-logo {
            width: 155px;

            height: auto;
          }

          .thermal-footer-description {
            margin-top: 16px;

            max-width: 100%;

            font-size: 13px;

            line-height: 1.65;
          }

          .thermal-footer-tagline {
            margin-top: 16px;

            font-size: 7px;

            letter-spacing: 0.16em;

            line-height: 1.5;
          }


          /* =================================================
            PLATFORM + RESOURCES
          ================================================= */

          .thermal-footer-column {
            padding-top: 0;

            width: 100%;
          }

          .thermal-footer-column h3 {
            margin: 0 0 16px;

            font-size: 12px;

            letter-spacing: 0.16em;

            line-height: 1.3;
          }

          .thermal-footer-column a {
            gap: 8px;

            margin-bottom: 12px;

            font-size: 13px;

            line-height: 1.4;
          }

          .thermal-footer-column a svg {
            width: 14px;

            height: 14px;
          }


          /* =================================================
            SUPPORT
            FULL WIDTH
          ================================================= */

          .thermal-footer-column:nth-child(4) {
            grid-column: 1 / -1;

            margin-top: 2px;
          }


          /* =================================================
            BOTTOM BAR
          ================================================= */

          .thermal-footer-bottom-container {
            width: calc(100% - 30px);

            min-height: auto;

            padding: 17px 0 19px;

            margin: 0 auto;

            display: flex;

            flex-direction: column;

            align-items: flex-start;

            justify-content: center;

            gap: 12px;

            font-size: 8px;

            line-height: 1.5;
          }


          /* =================================================
            SYSTEM STATUS
          ================================================= */

          .thermal-footer-system {
            gap: 7px;

            font-size: 7px;

            letter-spacing: 0.10em;
          }

          .thermal-footer-status-dot {
            width: 7px;

            height: 7px;
          }

        }


        /* =====================================================
   SMALL MOBILE
===================================================== */

@media (max-width: 420px) {

  .thermal-footer-container {
    width: calc(100% - 24px);

    padding: 32px 0 28px;

    grid-template-columns: 1fr 1fr;

    column-gap: 18px;

    row-gap: 27px;
  }


  /* =================================================
     BRAND
  ================================================= */

  .thermal-footer-brand {
    grid-column: 1 / -1;
  }

  .thermal-footer-logo {
    width: 145px;
  }

  .thermal-footer-description {
    margin-top: 14px;

    font-size: 12px;

    line-height: 1.65;
  }

  .thermal-footer-tagline {
    margin-top: 14px;

    font-size: 6px;

    letter-spacing: 0.14em;
  }


  /* =================================================
     COLUMNS
  ================================================= */

  .thermal-footer-column h3 {
    margin-bottom: 14px;

    font-size: 11px;

    letter-spacing: 0.14em;
  }

  .thermal-footer-column a {
    gap: 7px;

    margin-bottom: 11px;

    font-size: 12px;
  }

  .thermal-footer-column a svg {
    width: 13px;

    height: 13px;
  }


  /* =================================================
     SUPPORT
  ================================================= */

  .thermal-footer-column:nth-child(4) {
    grid-column: 1 / -1;

    margin-top: 0;
  }


  /* =================================================
     BOTTOM
  ================================================= */

  .thermal-footer-bottom-container {
    width: calc(100% - 24px);

    padding: 15px 0 17px;

    font-size: 7px;

    gap: 10px;
  }

  .thermal-footer-system {
    font-size: 6px;

    letter-spacing: 0.08em;
  }

}

@media (max-width: 350px) {

  .thermal-footer-container {
    width: calc(100% - 20px);

    padding: 28px 0 25px;

    column-gap: 14px;

    row-gap: 24px;
  }

  .thermal-footer-logo {
    width: 135px;
  }

  .thermal-footer-description {
    font-size: 11px;
  }

  .thermal-footer-tagline {
    font-size: 5.5px;
  }

  .thermal-footer-column h3 {
    font-size: 10px;
  }

  .thermal-footer-column a {
    font-size: 11px;

    margin-bottom: 10px;
  }

  .thermal-footer-column a svg {
    width: 12px;

    height: 12px;
  }

  .thermal-footer-bottom-container {
    width: calc(100% - 20px);

    font-size: 6.5px;
  }

  .thermal-footer-system {
    font-size: 5.5px;
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

          

            <Link to="/satellite-feeds">
              <Satellite />
              Satellite Feeds
            </Link>

            <Link to="/Alert">
              <BarChart3 />
              Alert
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