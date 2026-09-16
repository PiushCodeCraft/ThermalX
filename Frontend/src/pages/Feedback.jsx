import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Feedback.css";

function Feedback({ onSubmitFeedback }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
      return;
    }

    onSubmitFeedback({
      id: Date.now(),
      name: form.name,
      email: form.email,
      message: form.message,
      submittedAt: new Date().toISOString(),
    });

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      message: "",
    });
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
            Help us improve THERMAL X. Your feedback will be
            forwarded to the administrative team for review.
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
                Thank you. Your feedback has been sent to the
                THERMAL X administrative dashboard.
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


              <button
                type="submit"
                className="feedback-submit"
              >
                SUBMIT FEEDBACK
              </button>

            </form>

          )}

        </div>

      </div>

    </main>
  );
}

export default Feedback;