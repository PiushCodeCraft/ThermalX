import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  return (
    <>
      <style>{`

        .navbar {
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e5eaf0;
          position: relative;
          z-index: 1000;
          font-family: "Inter", sans-serif;
        }

        .navbar-inner {
          width: calc(100% - 40px);
          min-height: 62px;
          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

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

        .navbar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-left: auto;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 30px;
          padding: 0 15px;

          border: 1px solid #d8e0e7;
          background: #ffffff;

          color: #0f3550;
          text-decoration: none;

          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          white-space: nowrap;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .nav-link:hover {
          background: #f2f6f9;
          border-color: #0f3550;
          transform: translateY(-1px);
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

        .nav-auth:hover {
          background: #164b6d;
          border-color: #164b6d;
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {

          .navbar-inner {
            width: calc(100% - 20px);
            min-height: 76px;
          }

          .brand-logo {
            width: 110px;
          }

          .navbar-actions {
            gap: 6px;
          }

          .nav-link {
            min-height: 30px;
            padding: 0 12px;
            font-size: 11px;
          }

          .nav-auth {
            min-height: 30px;
            padding: 0 15px;
            font-size: 12px;
          }
        }

        @media (max-width: 600px) {

          .navbar-inner {
            width: calc(100% - 30px);
            min-height: 70px;
          }

          .brand-logo {
            width: 100px;
          }

          .navbar-actions {
            gap: 5px;
          }

          .nav-link {
            min-height: 30px;
            padding: 0 8px;
            font-size: 9px;
            letter-spacing: 0.03em;
          }

          .nav-auth {
            min-height: 30px;
            padding: 0 10px;
            font-size: 9px;
          }
        }

        @media (max-width: 400px) {

          .navbar-inner {
            width: calc(100% - 24px);
            min-height: 64px;
          }

          .brand-logo {
            width: 90px;
          }

          .nav-link {
            padding: 0 6px;
            font-size: 8px;
          }

          .nav-auth {
            padding: 0 8px;
            font-size: 8px;
          }
        }

      `}</style>

      <header className="navbar">

        <div className="navbar-inner">

          {/* LOGO */}

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


          {/* NAVIGATION */}

          <div className="navbar-actions">

            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/feedback"
                className="nav-link"
              >
                FEEDBACK
              </Link>
            </motion.div>


            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/live-map"
                className="nav-link"
              >
                LIVE MAP
              </Link>
            </motion.div>


            <motion.div
  whileHover={{ y: -1 }}
  whileTap={{ scale: 0.98 }}
>
  <Link
    to="/login"
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