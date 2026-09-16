import React, { useState } from "react";
import {
  BrainCircuit,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
} from "lucide-react";

import "./AIAnalysis.css";

const AIAnalysis = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const incidents = [
    {
      id: "TX-2401",
      location: "Northern Monitoring Region",
      confidence: "94.8%",
      classification: "High Fire Risk",
      status: "High",
      time: "10:42 AM",
    },
    {
      id: "TX-2402",
      location: "Central Monitoring Region",
      confidence: "87.3%",
      classification: "Fire Detected",
      status: "Medium",
      time: "10:36 AM",
    },
    {
      id: "TX-2403",
      location: "Southern Monitoring Region",
      confidence: "72.6%",
      classification: "Thermal Anomaly",
      status: "Low",
      time: "10:21 AM",
    },
  ];

  return (
    <div className="tx-ai-analysis">

      {/* HEADER */}

      <header className="tx-ai-header">
        <div>
          <span className="tx-ai-eyebrow">
            THERMAL-X / AI ENGINE
          </span>

          <h1>AI Analysis</h1>

          <p>
            Review thermal detections and AI-based
            fire-risk classifications.
          </p>
        </div>

        <div className="tx-ai-engine-status">
          <span />
          MODEL ACTIVE
        </div>
      </header>


      {/* MODEL STATUS */}

      <section className="tx-ai-status-grid">

        <div className="tx-ai-status-card">

          <div className="tx-ai-status-icon">
            <BrainCircuit size={21} />
          </div>

          <div>
            <span>MODEL STATUS</span>
            <strong>ACTIVE</strong>
          </div>

        </div>


        <div className="tx-ai-status-card">

          <div className="tx-ai-status-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>ANALYSES TODAY</span>
            <strong>73</strong>
          </div>

        </div>


        <div className="tx-ai-status-card">

          <div className="tx-ai-status-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>PROCESSING</span>
            <strong>READY</strong>
          </div>

        </div>


        <div className="tx-ai-status-card">

          <div className="tx-ai-status-icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>LAST UPDATE</span>
            <strong>10:42 AM</strong>
          </div>

        </div>

      </section>


      {/* ANALYSIS PANEL */}

      <section className="tx-ai-main-grid">

        {/* INCIDENT LIST */}

        <article className="tx-ai-incidents-card">

          <div className="tx-ai-card-header">

            <div>
              <span className="tx-ai-card-eyebrow">
                DETECTIONS
              </span>

              <h2>Recent AI Detections</h2>
            </div>

            <button
              type="button"
              className="tx-ai-refresh-button"
            >
              <RefreshCw size={15} />
              REFRESH
            </button>

          </div>


          <div className="tx-ai-incident-list">

            {incidents.map((incident) => (

              <button
                type="button"
                key={incident.id}
                className={`tx-ai-incident ${
                  selectedIncident?.id === incident.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedIncident(incident)
                }
              >

                <div className="tx-ai-incident-icon">
                  <AlertTriangle size={17} />
                </div>

                <div className="tx-ai-incident-info">

                  <strong>
                    {incident.id}
                  </strong>

                  <span>
                    {incident.location}
                  </span>

                </div>

                <div className="tx-ai-incident-confidence">

                  <span>
                    CONFIDENCE
                  </span>

                  <strong>
                    {incident.confidence}
                  </strong>

                </div>

                <div
                  className={`tx-ai-risk ${incident.status.toLowerCase()}`}
                >
                  {incident.status}
                </div>

              </button>

            ))}

          </div>

        </article>


        {/* ANALYSIS RESULT */}

        <article className="tx-ai-result-card">

          <div className="tx-ai-card-header">

            <div>
              <span className="tx-ai-card-eyebrow">
                MODEL OUTPUT
              </span>

              <h2>Analysis Result</h2>
            </div>

          </div>


          {selectedIncident ? (

            <div className="tx-ai-result">

              <div className="tx-ai-result-top">

                <div className="tx-ai-result-icon">
                  <BrainCircuit size={25} />
                </div>

                <div>
                  <span>
                    INCIDENT
                  </span>

                  <strong>
                    {selectedIncident.id}
                  </strong>
                </div>

              </div>


              <div className="tx-ai-result-classification">

                <span>
                  CLASSIFICATION
                </span>

                <strong>
                  {selectedIncident.classification}
                </strong>

              </div>


              <div className="tx-ai-confidence-box">

                <div>
                  <span>
                    MODEL CONFIDENCE
                  </span>

                  <strong>
                    {selectedIncident.confidence}
                  </strong>
                </div>

                <div className="tx-ai-confidence-bar">
                  <div
                    style={{
                      width:
                        selectedIncident.confidence,
                    }}
                  />
                </div>

              </div>


              <div className="tx-ai-result-details">

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {selectedIncident.location}
                  </strong>
                </div>

                <div>
                  <span>DETECTED</span>
                  <strong>
                    {selectedIncident.time}
                  </strong>
                </div>

                <div>
                  <span>RISK LEVEL</span>
                  <strong>
                    {selectedIncident.status}
                  </strong>
                </div>

              </div>

            </div>

          ) : (

            <div className="tx-ai-empty">

              <BrainCircuit size={38} />

              <strong>
                Select a detection
              </strong>

              <span>
                Select an incident from the list
                to view its AI analysis.
              </span>

            </div>

          )}

        </article>

      </section>


      {/* MODEL INFORMATION */}

      <section className="tx-ai-model-card">

        <div className="tx-ai-model-header">

          <div>
            <span className="tx-ai-card-eyebrow">
              MODEL INFORMATION
            </span>

            <h2>
              Thermal Classification Engine
            </h2>
          </div>

          <span className="tx-ai-model-badge">
            ONLINE
          </span>

        </div>


        <div className="tx-ai-model-grid">

          <div>
            <span>Input Source</span>
            <strong>Thermal Satellite Data</strong>
          </div>

          <div>
            <span>Processing</span>
            <strong>Automated Analysis</strong>
          </div>

          <div>
            <span>Output</span>
            <strong>Fire Risk Classification</strong>
          </div>

          <div>
            <span>Update Mode</span>
            <strong>Continuous</strong>
          </div>

        </div>

      </section>

    </div>
  );
};

export default AIAnalysis;