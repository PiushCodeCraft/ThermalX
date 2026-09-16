import React, { useEffect, useState } from "react";
import {
  BrainCircuit,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
} from "lucide-react";

import {
  getAIStatus,
  getAIAnalyses,
  getAIAnalysis,
} from "../../services/api";

import "./AIAnalysis.css";

const AIAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeAnalyses = (response) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.analyses)) {
      return response.analyses;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    return [];
  };

  const normalizeStatus = (response) => {
    if (!response) return null;

    if (response?.data && typeof response.data === "object") {
      return response.data;
    }

    if (response?.status && typeof response.status === "object") {
      return response.status;
    }

    return response;
  };

  const getValue = (item, keys, fallback = "N/A") => {
    for (const key of keys) {
      if (
        item?.[key] !== undefined &&
        item?.[key] !== null &&
        item?.[key] !== ""
      ) {
        return item[key];
      }
    }

    return fallback;
  };

  const formatConfidence = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "N/A";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value).includes("%")
        ? String(value)
        : `${value}%`;
    }

    const percentage =
      numericValue <= 1
        ? numericValue * 100
        : numericValue;

    return `${percentage.toFixed(1)}%`;
  };

  const confidenceNumber = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return 0;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return 0;
    }

    return numericValue <= 1
      ? numericValue * 100
      : numericValue;
  };

  const formatTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const normalizeIncident = (item) => {
    const confidenceValue = getValue(
      item,
      [
        "confidence",
        "modelConfidence",
        "model_confidence",
        "confidenceScore",
        "confidence_score",
      ],
      null
    );

    return {
      raw: item,

      id: getValue(
        item,
        [
          "id",
          "analysisId",
          "analysis_id",
          "incidentId",
          "incident_id",
        ]
      ),

      location: getValue(
        item,
        [
          "location",
          "region",
          "area",
          "detectedLocation",
          "detected_location",
        ]
      ),

      confidence: formatConfidence(confidenceValue),

      classification: getValue(
        item,
        [
          "classification",
          "prediction",
          "label",
          "riskClassification",
          "risk_classification",
        ]
      ),

      status: getValue(
        item,
        [
          "status",
          "riskLevel",
          "risk_level",
          "severity",
        ]
      ),

      time: formatTime(
        getValue(
          item,
          [
            "createdAt",
            "created_at",
            "detectedAt",
            "detected_at",
            "timestamp",
            "time",
          ],
          null
        )
      ),
    };
  };

  const loadAIData = async () => {
    setLoading(true);
    setError("");

    try {
      const [statusResponse, analysesResponse] =
        await Promise.all([
          getAIStatus(),
          getAIAnalyses(),
        ]);

      const statusData =
        normalizeStatus(statusResponse);

      const analysisData =
        normalizeAnalyses(analysesResponse);

      setAiStatus(statusData);
      setAnalyses(analysisData);

      /*
       * Preserve the currently selected analysis
       * after refresh when possible.
       */
      if (selectedIncident) {
        const currentId = selectedIncident.id;

        const refreshed =
          analysisData
            .map(normalizeIncident)
            .find(
              (item) => String(item.id) === String(currentId)
            );

        if (refreshed) {
          setSelectedIncident(refreshed);
        } else {
          setSelectedIncident(null);
        }
      }
    } catch (err) {
      console.error("AI analysis loading failed:", err);

      setError(
        err?.message ||
          "Unable to load AI analysis data."
      );

      setAnalyses([]);
      setAiStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, []);

  const handleSelectIncident = async (incident) => {
    setSelectedIncident(incident);

    /*
     * Fetch detailed AI analysis when an ID is
     * available. If the backend does not provide
     * a detail endpoint for that record, keep the
     * list data visible.
     */
    if (!incident?.id || incident.id === "N/A") {
      return;
    }

    setDetailLoading(true);

    try {
      const response =
        await getAIAnalysis(incident.id);

      const detail =
        response?.data ??
        response?.analysis ??
        response;

      if (detail && typeof detail === "object") {
        setSelectedIncident({
          ...incident,
          raw: detail,

          location: getValue(
            detail,
            [
              "location",
              "region",
              "area",
              "detectedLocation",
              "detected_location",
            ],
            incident.location
          ),

          confidence: formatConfidence(
            getValue(
              detail,
              [
                "confidence",
                "modelConfidence",
                "model_confidence",
                "confidenceScore",
                "confidence_score",
              ],
              null
            )
          ),

          classification: getValue(
            detail,
            [
              "classification",
              "prediction",
              "label",
              "riskClassification",
              "risk_classification",
            ],
            incident.classification
          ),

          status: getValue(
            detail,
            [
              "status",
              "riskLevel",
              "risk_level",
              "severity",
            ],
            incident.status
          ),

          time: formatTime(
            getValue(
              detail,
              [
                "createdAt",
                "created_at",
                "detectedAt",
                "detected_at",
                "timestamp",
                "time",
              ],
              null
            )
          ),
        });
      }
    } catch (err) {
      /*
       * Do not remove the selected item if the
       * detailed endpoint fails. The list result
       * remains available.
       */
      console.error(
        "AI analysis detail loading failed:",
        err
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const modelStatus = getValue(
    aiStatus,
    [
      "status",
      "state",
      "modelStatus",
      "model_status",
      "health",
    ],
    "N/A"
  );

  const processingStatus = getValue(
    aiStatus,
    [
      "processing",
      "processingStatus",
      "processing_status",
      "availability",
      "state",
    ],
    "N/A"
  );

  const analysesToday = getValue(
    aiStatus,
    [
      "analysesToday",
      "analyses_today",
      "todayCount",
      "today_count",
      "dailyAnalyses",
      "daily_analyses",
    ],
    null
  );

  const lastUpdate = getValue(
    aiStatus,
    [
      "lastUpdate",
      "last_update",
      "updatedAt",
      "updated_at",
      "timestamp",
    ],
    null
  );

  const statusText =
    modelStatus === "N/A"
      ? "N/A"
      : String(modelStatus).toUpperCase();

  const processingText =
    processingStatus === "N/A"
      ? "N/A"
      : String(processingStatus).toUpperCase();

  const normalizedAnalyses =
    analyses.map(normalizeIncident);

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

        <div
          className={`tx-ai-engine-status ${
            statusText === "N/A"
              ? "unavailable"
              : statusText === "ACTIVE" ||
                statusText === "ONLINE" ||
                statusText === "READY"
              ? "online"
              : "offline"
          }`}
        >
          <span />
          {statusText}
        </div>
      </header>


      {/* ERROR */}

      {error && (
        <div className="tx-ai-api-error">
          <div>
            <strong>
              Unable to load AI analysis
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={loadAIData}
          >
            <RefreshCw size={15} />
            RETRY
          </button>
        </div>
      )}


      {/* MODEL STATUS */}

      <section className="tx-ai-status-grid">

        <div className="tx-ai-status-card">
          <div className="tx-ai-status-icon">
            <BrainCircuit size={21} />
          </div>

          <div>
            <span>MODEL STATUS</span>

            <strong>
              {loading ? "LOADING..." : statusText}
            </strong>
          </div>
        </div>


        <div className="tx-ai-status-card">
          <div className="tx-ai-status-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>ANALYSES TODAY</span>

            <strong>
              {loading
                ? "..."
                : analysesToday !== null
                ? analysesToday
                : "N/A"}
            </strong>
          </div>
        </div>


        <div className="tx-ai-status-card">
          <div className="tx-ai-status-icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>PROCESSING</span>

            <strong>
              {loading
                ? "..."
                : processingText}
            </strong>
          </div>
        </div>


        <div className="tx-ai-status-card">
          <div className="tx-ai-status-icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>LAST UPDATE</span>

            <strong>
              {loading
                ? "..."
                : formatTime(lastUpdate)}
            </strong>
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

              <h2>
                Recent AI Detections
              </h2>
            </div>

            <button
              type="button"
              className="tx-ai-refresh-button"
              onClick={loadAIData}
              disabled={loading}
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "tx-ai-refresh-spin"
                    : ""
                }
              />

              {loading
                ? "LOADING"
                : "REFRESH"}
            </button>

          </div>


          <div className="tx-ai-incident-list">

            {loading ? (

              <div className="tx-ai-loading">
                <RefreshCw
                  size={24}
                  className="tx-ai-refresh-spin"
                />

                <span>
                  Loading AI detections...
                </span>
              </div>

            ) : normalizedAnalyses.length > 0 ? (

              normalizedAnalyses.map(
                (incident) => (

                  <button
                    type="button"
                    key={incident.id}
                    className={`tx-ai-incident ${
                      selectedIncident?.id ===
                      incident.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSelectIncident(
                        incident
                      )
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
                      className={`tx-ai-risk ${
                        String(
                          incident.status
                        ).toLowerCase()
                      }`}
                    >
                      {incident.status}
                    </div>

                  </button>

                )
              )

            ) : (

              <div className="tx-ai-empty-list">

                <BrainCircuit size={32} />

                <strong>
                  No AI detections available
                </strong>

                <span>
                  The backend has not returned any
                  AI analysis records.
                </span>

              </div>

            )}

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

              {detailLoading && (
                <div className="tx-ai-detail-loading">
                  <RefreshCw
                    size={14}
                    className="tx-ai-refresh-spin"
                  />
                  Updating analysis...
                </div>
              )}

              <div className="tx-ai-result-top">

                <div className="tx-ai-result-icon">
                  <BrainCircuit size={25} />
                </div>

                <div>
                  <span>INCIDENT</span>

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
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          confidenceNumber(
                            selectedIncident.confidence
                          )
                        )
                      )}%`,
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

          <span
            className={`tx-ai-model-badge ${
              statusText === "N/A"
                ? "unavailable"
                : ""
            }`}
          >
            {statusText}
          </span>

        </div>


        <div className="tx-ai-model-grid">

          <div>
            <span>Input Source</span>

            <strong>
              Thermal Satellite Data
            </strong>
          </div>

          <div>
            <span>Processing</span>

            <strong>
              Automated Analysis
            </strong>
          </div>

          <div>
            <span>Output</span>

            <strong>
              Fire Risk Classification
            </strong>
          </div>

          <div>
            <span>Update Mode</span>

            <strong>
              Continuous
            </strong>
          </div>

        </div>

      </section>

    </div>
  );
};

export default AIAnalysis;