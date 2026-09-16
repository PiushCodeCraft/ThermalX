import React, { useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Clock3,
  CheckCircle2,
  Mail,
} from "lucide-react";

import "./Feedback.css";

const Feedback = ({ feedbacks = [] }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const demoFeedback = [
    {
      id: "FDB-001",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      message:
        "The live thermal map is very useful. It would be helpful to have more regional filtering options.",
      submittedAt: "16 Sep 2026, 10:42 AM",
      status: "New",
    },
    {
      id: "FDB-002",
      name: "Priya Singh",
      email: "priya@example.com",
      message:
        "The incident information is clear and easy to understand.",
      submittedAt: "16 Sep 2026, 09:35 AM",
      status: "Reviewed",
    },
    {
      id: "FDB-003",
      name: "Arjun Kumar",
      email: "arjun@example.com",
      message:
        "Please consider adding additional information about the AI analysis results.",
      submittedAt: "15 Sep 2026, 06:21 PM",
      status: "New",
    },
  ];

  const allFeedbacks =
    feedbacks.length > 0
      ? feedbacks
      : demoFeedback;

  const filteredFeedbacks = useMemo(() => {
    return allFeedbacks.filter((feedback) => {
      const query = search.toLowerCase();

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
  }, [allFeedbacks, search, filter]);

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
            {allFeedbacks.length} SUBMISSIONS
          </span>

        </div>

      </header>


      {/* SUMMARY */}

      <section className="tx-admin-feedback-summary">

        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <MessageSquare size={18} />
          </div>

          <div>
            <span>Total Feedback</span>
            <strong>{allFeedbacks.length}</strong>
          </div>

        </div>


        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>New Feedback</span>
            <strong>
              {
                allFeedbacks.filter(
                  (item) => item.status === "New"
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="tx-admin-feedback-summary-card">

          <div className="tx-admin-feedback-summary-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Reviewed</span>
            <strong>
              {
                allFeedbacks.filter(
                  (item) => item.status === "Reviewed"
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

              <div className="tx-admin-feedback-avatar">
                {feedback.name
                  .charAt(0)
                  .toUpperCase()}
              </div>


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


                <p>
                  {feedback.message}
                </p>


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


          {filteredFeedbacks.length === 0 && (

            <div className="tx-admin-feedback-empty">

              <MessageSquare size={30} />

              <strong>
                No feedback found
              </strong>

              <span>
                Try changing your search or filter.
              </span>

            </div>

          )}

        </div>

      </section>

    </div>
  );
};

export default Feedback;