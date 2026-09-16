const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const request = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (errorData?.message) {
        message = errorData.message;
      }
    } catch {
      // Ignore invalid error response
    }

    throw new Error(message);
  }

  return response.json();
};


/* =========================================================
   DASHBOARD
========================================================= */

export const getDashboard =
  () =>
    request(
      "/api/admin/dashboard"
    );


/* =========================================================
   INCIDENTS
========================================================= */

export const getIncidents =
  (params = "") =>
    request(
      `/api/incidents${params}`
    );

export const getIncident =
  (id) =>
    request(
      `/api/incidents/${id}`
    );


/* =========================================================
   FIRMS
========================================================= */

export const getFirmsDetections =
  () =>
    request(
      "/api/firms/detections"
    );

export const getFirmsStatus =
  () =>
    request(
      "/api/firms/status"
    );


/* =========================================================
   AI
========================================================= */

export const getAIStatus =
  () =>
    request(
      "/api/ai/status"
    );

export const getAIAnalyses =
  () =>
    request(
      "/api/ai/analyses"
    );

export const getAIAnalysis =
  (id) =>
    request(
      `/api/ai/analyses/${id}`
    );

export const runAIAnalysis =
  (data) =>
    request(
      "/api/ai/analyze",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );


/* =========================================================
   REPORTS
========================================================= */

export const getReports =
  () =>
    request(
      "/api/reports"
    );

export const getReport =
  (id) =>
    request(
      `/api/reports/${id}`
    );


/* =========================================================
   USERS
========================================================= */

export const getUsers =
  () =>
    request(
      "/api/users"
    );

export const getUser =
  (id) =>
    request(
      `/api/users/${id}`
    );


/* =========================================================
   FEEDBACK
========================================================= */

export const getFeedback =
  () =>
    request(
      "/api/feedback"
    );

export const getFeedbackItem =
  (id) =>
    request(
      `/api/feedback/${id}`
    );


/* =========================================================
   SYSTEM
========================================================= */

export const getSystemStatus =
  () =>
    request(
      "/api/system/status"
    );


export {
  API_URL,
};