import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import "./AuthPage.css";

function AuthPage({ onLogin }) {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     INPUT HANDLER
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error while user types
    if (error) {
      setError("");
    }
  };

  /* =====================================================
     LOGIN SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!formData.userId || !formData.password) {
      setError("Please enter your user ID and password.");

      return;
    }

    setLoading(true);

    try {
      // ---------------------------------------------------
      // SEND LOGIN REQUEST TO BACKEND
      // ---------------------------------------------------

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      // ---------------------------------------------------
      // LOGIN FAILED
      // ---------------------------------------------------

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid user ID or password.");

        return;
      }

      // ---------------------------------------------------
      // LOGIN SUCCESS
      // ---------------------------------------------------

      console.log("Admin login successful:", data.admin);

      // Store admin information
      localStorage.setItem("thermalx_admin", JSON.stringify(data.admin));

      localStorage.setItem("thermalx_admin_logged_in", "true");

      // Tell App.jsx that login succeeded
      if (onLogin) {
        onLogin("admin");
      }
    } catch (error) {
      console.error("Login request failed:", error);

      setError("Unable to connect to the Thermal X server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* =================================================
          BACKGROUND VIDEO
      ================================================== */}

      <video
        className="auth-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/earth-space.mp4" type="video/mp4" />
        Your browser does not support video playback.
      </video>

      {/* =================================================
          VIDEO OVERLAY
      ================================================== */}

      <div className="auth-video-overlay" />

      {/* =================================================
          AUTH LAYOUT
      ================================================== */}

      <section className="auth-layout">
        {/* =================================================
            LEFT BRAND PANEL
        ================================================== */}

        <motion.section
          className="auth-brand-panel"
          initial={{
            opacity: 0,
            x: -30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        >
          {/* LOGO */}

          <div className="auth-logo-wrapper">
            <Link to="/" className="auth-logo-link" aria-label="THERMAL X Home">
              <img
                src="/assets/thermal-x-logo.png"
                alt="THERMAL X"
                className="auth-logo-image"
              />
            </Link>
          </div>

          {/* BRAND CONTENT */}

          <div className="auth-brand-content">
            <div className="brand-eyebrow">SATELLITE INTELLIGENCE</div>

            <div className="brand-title">
              <div className="heat-title">SEE THE HEAT.</div>

              <div className="change-title">UNDERSTAND THE CHANGE.</div>
            </div>

            <div className="brand-description">
              Thermal X combines satellite thermal observations, geospatial
              intelligence and AI-powered analysis to detect, understand and
              investigate significant thermal events.
            </div>
          </div>

          {/* LEFT FOOTER */}

          <div className="brand-footer">
            <span>THERMAL X</span>

            <span>SATELLITE THERMAL INTELLIGENCE</span>
          </div>
        </motion.section>

        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================== */}

        <motion.section
          className="auth-form-panel"
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: "easeOut",
          }}
        >
          <div className="auth-card">
            {/* =================================================
                LOGIN HEADER
            ================================================== */}

            <div className="auth-heading">
              <div className="auth-eyebrow">THERMAL X ACCESS</div>

              <h1 className="auth-title">Welcome Back.</h1>

              <div className="auth-description">
                Sign in to access the Thermal X platform.
              </div>
            </div>

            {/* =================================================
                LOGIN FORM
            ================================================== */}

            <motion.form
              className="auth-form"
              onSubmit={handleSubmit}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              {/* USER ID */}

              <div className="form-field">
                <label htmlFor="userId">USER ID</label>

                <input
                  id="userId"
                  name="userId"
                  type="email"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-field">
                <label htmlFor="password">PASSWORD</label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* ERROR */}

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* LOGIN */}

              <motion.button
                type="submit"
                className="auth-submit"
                disabled={loading}
                whileHover={!loading ? { y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? "VERIFYING..." : "LOGIN"}
              </motion.button>
            </motion.form>
          </div>
        </motion.section>
      </section>
    </main>
  );
}

export default AuthPage;
