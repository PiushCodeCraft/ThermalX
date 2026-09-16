import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Feedback.css";


const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";


function Feedback({ onSubmitFeedback }) {

  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });


  const [submitted, setSubmitted] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  // =====================================================
  // INPUT HANDLER
  // =====================================================

  const handleChange = (event) => {

    const {
      name,
      value
    } = event.target;


    setForm((previous) => ({

      ...previous,

      [name]: value,

    }));


    if (error) {

      setError("");

    }

  };


  // =====================================================
  // SUBMIT FEEDBACK
  // =====================================================

const handleSubmit = async (event) => {

  event.preventDefault();

  console.log("====================================");
  console.log("🔥 FEEDBACK SUBMIT CLICKED");
  console.log("====================================");

  setError("");

  console.log("Form data:", form);


  // -----------------------------------------------------
  // VALIDATION
  // -----------------------------------------------------

  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.message.trim()
  ) {

    console.log("❌ Validation failed");

    setError(
      "Please fill in all fields."
    );

    return;
  }


  console.log("✅ Validation passed");


  setLoading(true);


  try {

    console.log(
      "🚀 Sending request to:",
      `${API_URL}/api/feedback`
    );

    const response = await fetch(`${API_URL}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }),
    });


    console.log(
      "📡 Response received"
    );

    console.log(
      "Status:",
      response.status
    );

    console.log(
      "OK:",
      response.ok
    );


    const data = await response.json();


    console.log(
      "📦 Feedback API response:",
      data
    );


    if (
      !response.ok ||
      !data.success
    ) {

      console.log(
        "❌ Backend rejected feedback"
      );


      setError(
        data.message ||
        "Failed to submit feedback."
      );

      return;
    }


    console.log(
      "✅ Feedback successfully saved to Supabase"
    );


    setSubmitted(true);


    setForm({
      name: "",
      email: "",
      message: "",
    });


    if (onSubmitFeedback) {

      onSubmitFeedback(
        data.data
      );

    }

  }

  catch (error) {

    console.error(
      "🔥 Feedback request failed:",
      error
    );


    setError(
      "Unable to connect to the Thermal X server."
    );

  }

  finally {

    console.log(
      "🏁 Feedback request finished"
    );

    setLoading(false);

  }

};


  return (

    <main className="feedback-page">

      <div className="feedback-container">


        <Link
          to="/"
          className="feedback-back"
        >
          ← BACK TO HOME
        </Link>


        <div className="feedback-card">


          <div className="feedback-eyebrow">
            THERMAL X / USER FEEDBACK
          </div>


          <h1>
            Share Your
            <span> Feedback.</span>
          </h1>


          <p className="feedback-description">
            Help us improve THERMAL X. Your feedback
            will be forwarded to the administrative
            team for review.
          </p>


          {submitted ? (

            <div className="feedback-success">


              <div className="feedback-success-icon">
                ✓
              </div>


              <h2>
                Feedback Submitted
              </h2>


              <p>
                Thank you. Your feedback has been
                sent to the THERMAL X administrative
                dashboard.
              </p>


              <button
                type="button"
                onClick={() => navigate("/")}
              >
                RETURN HOME
              </button>


            </div>

          ) : (

            <form
              className="feedback-form"
              onSubmit={handleSubmit}
            >


              {/* NAME */}

              <label>

                Name

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

              </label>


              {/* EMAIL */}

              <label>

                Email

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

              </label>


              {/* FEEDBACK */}

              <label>

                Feedback

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you think..."
                  rows="6"
                  required
                />

              </label>


              {/* ERROR */}

              {error && (

                <div className="feedback-error">
                  {error}
                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="feedback-submit"
                disabled={loading}
              >

                {loading
                  ? "SUBMITTING..."
                  : "SUBMIT FEEDBACK"
                }

              </button>


            </form>

          )}

        </div>

      </div>

    </main>

  );

}


export default Feedback;