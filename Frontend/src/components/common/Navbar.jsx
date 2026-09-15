import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  return (
    <>
      {/* =====================================================
          NAVBAR STYLES
      ====================================================== */}

      <style>{`

        /* =====================================================
           MAIN NAVBAR
        ====================================================== */

        .navbar {
          width:100%;

          background: #ffffff;

          border-bottom: 1px solid #e5eaf0;

          position: relative;

          z-index: 1000;

          font-family: "Inter", sans-serif;
        }


        /* =====================================================
           NAVBAR INNER
        ====================================================== */

        .navbar-inner {
            width: calc(100% - 40px);
            margin: 0 auto;

          min-height: 62px;

          margin: 0 auto;

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        /* =====================================================
           LOGO - LEFT
        ====================================================== */

        .brand {
          display: flex;

          align-items: center;

          text-decoration: none;

          flex-shrink: 0;
        }

        .brand-logo {
          width: 100px;

          height: auto;

          display: block;

          object-fit: contain;
        }


        /* =====================================================
           LOGIN / REGISTER - RIGHT
        ====================================================== */

        .navbar-actions {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          margin-left: auto;
        }

        .nav-auth {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-height: 30px;

          padding: 0 20px;

          border: 1px solid #0f3550;

          background: #0f3550;

          color: #ffffff;

          text-decoration: none;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.08em;

          white-space: nowrap;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }


        /* =====================================================
           LOGIN HOVER
        ====================================================== */

        .nav-auth:hover {
          background: #164b6d;

          border-color: #164b6d;

          transform: translateY(-1px);
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 900px) {

          .navbar-inner {
            width: calc(100% - 20px);

            min-height: 76px;
          }

          .brand-logo {
            width: 110px;
          }

          .nav-auth {
            min-height: 30px;

            padding: 0 20px;

            font-size: 12px;
          }

        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 600px) {

          .navbar-inner {
            width: calc(100% - 30px);

            min-height: 70px;
          }

          .brand-logo {
            width: 110px;
          }

          .nav-auth {
            min-height: 30px;

            padding: 0 12px;

            font-size: 10px;

            letter-spacing: 0.06em;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 400px) {

          .navbar-inner {
            width: calc(100% - 24px);

            min-height: 64px;
          }

          .brand-logo {
            width: 135px;
          }

          .nav-auth {
            min-height: 36px;

            padding: 0 12px;

            font-size: 9px;
          }

        }

      `}</style>


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="navbar">

        <div className="navbar-inner">


          {/* =================================================
              LOGO - LEFT
          ================================================= */}

          <Link
            to="/"
            className="brand"
            aria-label="THERMAL X Home"
          >

            <img
              src="/assets/thermal-x-logo.png"
              alt="THERMAL X"
              className="brand-logo"
            />

          </Link>


          {/* =================================================
              LOGIN / REGISTER - RIGHT
          ================================================= */}

          <div className="navbar-actions">

            <motion.div
              whileHover={{
                y: -1,
              }}

              whileTap={{
                scale: 0.98,
              }}
            >

              <Link
                to="/auth"
                className="nav-auth"
              >
                LOGIN 
              </Link>

            </motion.div>

          </div>

        </div>

      </header>
    </>
  );
}

export default Navbar;