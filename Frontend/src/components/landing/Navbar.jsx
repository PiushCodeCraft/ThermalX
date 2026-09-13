import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import "./navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">

      <div className="navbar-inner">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
          aria-label="THERMAL X Home"
        >
         <img
          src="/assets/thermal-x-logo.png"
          alt="THERMAL X"
          className="brand-logo"
        />
        </Link>


        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className="main-navigation"
          aria-label="Main navigation"
        >

          <a
            href="#home"
            onClick={closeMenu}
          >
            Home
          </a>

          <a
            href="#platform"
            onClick={closeMenu}
          >
            Platform
          </a>

          <a
            href="#mission"
            onClick={closeMenu}
          >
            Our Mission
          </a>

          <a
            href="#features"
            onClick={closeMenu}
          >
            Features
          </a>

          <a
            href="#impact"
            onClick={closeMenu}
          >
            Impact
          </a>

          <a
            href="#about"
            onClick={closeMenu}
          >
            About
          </a>

        </nav>


        {/* =================================================
            SINGLE LOGIN / REGISTER BUTTON
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
              onClick={closeMenu}
            >
              LOGIN / REGISTER
            </Link>
          </motion.div>

        </div>


        {/* =================================================
            MOBILE HAMBURGER
        ================================================= */}

        <button
          type="button"
          className={`mobile-menu-button ${
            menuOpen ? "active" : ""
          }`}
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-menu"
        >

          <span></span>
          <span></span>
          <span></span>

        </button>

      </div>


      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <AnimatePresence>

        {menuOpen && (

          <motion.div
            id="mobile-navigation-menu"
            className="mobile-menu"

            initial={{
              opacity: 0,
              y: -15,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              y: -15,
            }}

            transition={{
              duration: 0.22,
            }}
          >

            {/* =============================================
                MOBILE NAVIGATION
            ============================================= */}

            <nav
              className="mobile-navigation"
              aria-label="Mobile navigation"
            >

              <a
                href="#home"
                onClick={closeMenu}
              >
                Home
              </a>

              <a
                href="#platform"
                onClick={closeMenu}
              >
                Platform
              </a>

              <a
                href="#mission"
                onClick={closeMenu}
              >
                Our Mission
              </a>

              <a
                href="#features"
                onClick={closeMenu}
              >
                Features
              </a>

              <a
                href="#impact"
                onClick={closeMenu}
              >
                Impact
              </a>

              <a
                href="#about"
                onClick={closeMenu}
              >
                About
              </a>

            </nav>


            {/* =============================================
                SINGLE MOBILE AUTH BUTTON
            ============================================= */}

            <div className="mobile-actions">

              <Link
                to="/auth"
                className="mobile-auth"
                onClick={closeMenu}
              >
                LOGIN / REGISTER
              </Link>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </header>
  );
}

export default Navbar;