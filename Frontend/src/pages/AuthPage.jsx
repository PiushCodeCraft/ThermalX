import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import "./AuthPage.css";

function AuthPage() {
  const [mode, setMode] = useState("login");

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
     SUBMIT
  ===================================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    /* -----------------------------------------------
       REGISTER
    ------------------------------------------------ */

    if (mode === "register") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      console.log("Registration submitted:", {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert(
        "Registration successful. You can now login with your registered credentials."
      );

      setFormData({
        userId: formData.userId,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setMode("login");

      return;
    }

    /* -----------------------------------------------
       LOGIN
    ------------------------------------------------ */

    console.log("Login submitted:", {
      userId: formData.userId,
      password: formData.password,
    });

    alert("Login submitted.");
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


          {/* =================================================
              LEFT FOOTER
              Stays at bottom of panel
          ================================================== */}

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
            RIGHT AUTHENTICATION PANEL
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
                AUTH HEADER
            ================================================== */}

            <div className="auth-heading">

              <div className="auth-eyebrow">
                THERMAL X ACCESS
              </div>

              <h1 className="auth-title">
                {mode === "login"
                  ? "Welcome Back."
                  : "Create Your Account."}
              </h1>

              <div className="auth-description">
                {mode === "login"
                  ? "Sign in to access the Thermal X platform."
                  : "Register once to create your Thermal X user account."}
              </div>

            </div>


            {/* =================================================
                FORM
            ================================================== */}

            <AnimatePresence mode="wait">

              <motion.form
                key={mode}
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
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                transition={{
                  duration: 0.2,
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


                {/* REGISTER FIELDS */}

                {mode === "register" && (
                  <>
                    <div className="form-field">

                      <label htmlFor="name">
                        FULL NAME
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                      />

                    </div>


                    <div className="form-field">

                      <label htmlFor="email">
                        EMAIL ADDRESS
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                      />

                    </div>
                  </>
                )}


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
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                {mode === "register" && (
                  <div className="form-field">

                    <label htmlFor="confirmPassword">
                      CONFIRM PASSWORD
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />

                  </div>
                )}


                {/* SUBMIT */}

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
                  {mode === "login"
                    ? "LOGIN"
                    : "CREATE ACCOUNT"}
                </motion.button>

              </motion.form>

            </AnimatePresence>


            {/* =================================================
                REGISTER / LOGIN SWITCH
            ================================================== */}

            <div className="auth-switch">

              {mode === "login" ? (
                <>
                  <span>
                    First time using Thermal X?
                  </span>

                  <button
                    type="button"
                    onClick={() => setMode("register")}
                  >
                    REGISTER
                  </button>
                </>
              ) : (
                <>
                  <span>
                    Already have an account?
                  </span>

                  <button
                    type="button"
                    onClick={() => setMode("login")}
                  >
                    LOGIN
                  </button>
                </>
              )}

            </div>


            {/* =================================================
                SECURITY
            ================================================== */}

            {/*
            <div className="auth-security">

              <span className="security-dot" />

              SECURE THERMAL X AUTHENTICATION

            </div>
            */}

          </div>

        </motion.section>

      </section>

    </main>
  );
}

export default AuthPage;