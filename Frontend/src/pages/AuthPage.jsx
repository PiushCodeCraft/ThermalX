import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import "./AuthPage.css";

function AuthPage({ onLogin }) {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });


  /* =====================================================
     INPUT HANDLER
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     LOGIN SUBMIT
  ===================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.userId || !formData.password) {
      return;
    }

    console.log("Login submitted:", {
      userId: formData.userId,
      password: formData.password,
    });

    /*
      Temporary frontend login.

      Later this will be replaced with
      backend authentication.
    */

    if (onLogin) {
      onLogin("basic");
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
        <source
          src="/earth-space.mp4"
          type="video/mp4"
        />

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

            <Link
              to="/"
              className="auth-logo-link"
              aria-label="THERMAL X Home"
            >
              <img
                src="/assets/thermal-x-logo.png"
                alt="THERMAL X"
                className="auth-logo-image"
              />
            </Link>

          </div>


          {/* BRAND CONTENT */}

          <div className="auth-brand-content">

            <div className="brand-eyebrow">
              SATELLITE INTELLIGENCE
            </div>

            <div className="brand-title">

              <div className="heat-title">
                SEE THE HEAT.
              </div>

              <div className="change-title">
                UNDERSTAND THE CHANGE.
              </div>

            </div>

            <div className="brand-description">
              Thermal X combines satellite thermal
              observations, geospatial intelligence
              and AI-powered analysis to detect,
              understand and investigate significant
              thermal events.
            </div>

          </div>


          {/* LEFT FOOTER */}

          <div className="brand-footer">

            <span>
              THERMAL X
            </span>

            <span>
              SATELLITE THERMAL INTELLIGENCE
            </span>

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

              <div className="auth-eyebrow">
                THERMAL X ACCESS
              </div>

              <h1 className="auth-title">
                Welcome Back.
              </h1>

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

                <label htmlFor="userId">
                  USER ID
                </label>

                <input
                  id="userId"
                  name="userId"
                  type="text"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your user ID"
                  autoComplete="username"
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="form-field">

                <label htmlFor="password">
                  PASSWORD
                </label>

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


              {/* LOGIN */}

              <motion.button
                type="submit"
                className="auth-submit"
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                LOGIN
              </motion.button>

            </motion.form>

          </div>

        </motion.section>

      </section>

    </main>
  );
}

export default AuthPage;