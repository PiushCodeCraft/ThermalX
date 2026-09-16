import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Clock3,
  CheckCircle2,
  Mail,
} from "lucide-react";

import "./Feedback.css";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH FEEDBACK FROM DATABASE
  // =====================================================

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/feedback"
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const result = await response.json();

        console.log("📩 Feedback data received:", result);

        if (result.success) {
          setFeedbacks(result.data || []);
        } else {
          setError(
            result.message || "Failed to fetch feedback."
          );
        }
      } catch (err) {
        console.error(
          "❌ Error fetching feedback:",
          err
        );

        setError(
          "Unable to connect to the Thermal-X backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // =====================================================
  // FORMAT DATABASE FEEDBACK
  // =====================================================

  const formattedFeedbacks = useMemo(() => {
    return feedbacks.map((feedback) => ({
      id: `FDB-${String(feedback.id).padStart(3, "0")}`,
      name: feedback.name || "Unknown User",
      email: feedback.email || "No email",
      message: feedback.message || "",
      submittedAt: feedback.created_at
        ? new Date(
            feedback.created_at
          ).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Unknown date",
      status: "New",
    }));
  }, [feedbacks]);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredFeedbacks = useMemo(() => {
    return formattedFeedbacks.filter((feedback) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        feedback.name
          .toLowerCase()
          .includes(query) ||
        feedback.email
          .toLowerCase()
          .includes(query) ||
        feedback.message
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "All" ||
        feedback.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [formattedFeedbacks, search, filter]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="tx-admin-feedback">
        <div className="tx-admin-feedback-empty">
          <MessageSquare size={30} />

          <strong>
            Loading feedback...
          </strong>

          <span>
            Fetching user feedback from the database.
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="tx-admin-feedback">

      {/* HEADER */}

      <header className="tx-admin-feedback-header">

        <div>
          <span className="tx-admin-feedback-eyebrow">
            THERMAL-X / USER FEEDBACK
          </span>

          <h1>User Feedback</h1>

          <p>
            Review feedback submitted by THERMAL-X
            users.
          </p>
        </div>

        <div className="tx-admin-feedback-count">

          <MessageSquare size={17} />

          <span>
            {feedbacks.length} SUBMISSIONS
          </span>

        </div>

      </header>


      {/* ERROR */}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            color: "#b91c1c",
            background: "#fef2f2",
          }}
        >
          {error}
        </div>
      )}


      {/* SUMMARY */}

      <section className="tx-admin-feedback-summary">

        {/* TOTAL */}

        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <MessageSquare size={18} />
          </div>

          <div>
            <span>Total Feedback</span>

            <strong>
              {feedbacks.length}
            </strong>
          </div>

        </div>


        {/* NEW */}

        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>New Feedback</span>

            <strong>
              {
                formattedFeedbacks.filter(
                  (item) => item.status === "New"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* REVIEWED */}

        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Reviewed</span>

            <strong>
              {
                formattedFeedbacks.filter(
                  (item) =>
                    item.status === "Reviewed"
                ).length
              }
            </strong>
          </div>

        </div>

      </section>


      {/* FEEDBACK CARD */}

      <section className="tx-admin-feedback-card">

        <div className="tx-admin-feedback-card-header">

          <div>
            <span className="tx-admin-feedback-card-eyebrow">
              SUBMISSIONS
            </span>

            <h2>Feedback Inbox</h2>
          </div>

        </div>


        {/* FILTERS */}

        <div className="tx-admin-feedback-filters">

          <div className="tx-admin-feedback-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >

            <option value="All">
              All Feedback
            </option>

            <option value="New">
              New
            </option>

            <option value="Reviewed">
              Reviewed
            </option>

          </select>

        </div>


        {/* FEEDBACK LIST */}

        <div className="tx-admin-feedback-list">

          {filteredFeedbacks.map((feedback) => (

            <article
              className="tx-admin-feedback-item"
              key={feedback.id}
            >

              {/* AVATAR */}

              <div className="tx-admin-feedback-avatar">

                {feedback.name
                  .charAt(0)
                  .toUpperCase()}

              </div>


              {/* CONTENT */}

              <div className="tx-admin-feedback-content">

                <div className="tx-admin-feedback-top">

                  <div>

                    <strong>
                      {feedback.name}
                    </strong>

                    <span>
                      <Mail size={11} />
                      {feedback.email}
                    </span>

                  </div>

                  <span
                    className={`tx-admin-feedback-status ${
                      feedback.status.toLowerCase()
                    }`}
                  >
                    {feedback.status}
                  </span>

                </div>


                {/* MESSAGE */}

                <p>
                  {feedback.message}
                </p>


                {/* META */}

                <div className="tx-admin-feedback-meta">

                  <span>
                    {feedback.id}
                  </span>

                  <span>
                    {feedback.submittedAt}
                  </span>

                </div>

              </div>

            </article>

          ))}


          {/* EMPTY */}

          {filteredFeedbacks.length === 0 && (

            <div className="tx-admin-feedback-empty">

              <MessageSquare size={30} />

              <strong>
                No feedback found
              </strong>

              <span>
                {search
                  ? "Try changing your search."
                  : "No user feedback has been submitted yet."}
              </span>

            </div>

          )}

        </div>

      </section>

    </div>
  );
};

export default Feedback;