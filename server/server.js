const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./db");
const { connectPostgreSQL } = require("./postgres");

const adminRoutes = require("./routes/admin");
const feedbackRoutes = require("./routes/feedback");
const userRequestRoutes = require("./routes/userRequests");
const aiAnalysisRoutes = require("./routes/aiAnalysis");
const fireRoutes = require("./routes/fire");
const incidentRoutes =
  require("./routes/incidents");
const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// BASIC ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "Thermal-X backend is running",
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/fire", fireRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/user-requests", userRequestRoutes);
app.use(
  "/api/incidents",
  incidentRoutes
);
app.use(
  "/api/ai-analysis",
  aiAnalysisRoutes
);
// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB Atlas
    await connectMongoDB();

    // Connect local PostgreSQL
    // await connectPostgreSQL();

    app.listen(PORT, () => {
      console.log(`\n🔥 Thermal-X server running on port ${PORT}`);

      console.log("\n======================================");
      console.log("🔥 THERMAL-X API");
      console.log("======================================");

      console.log(`🌐 Backend:     http://localhost:${PORT}`);
      console.log(`📊 Fire Count:  http://localhost:${PORT}/api/fire/count`);
      console.log(`🔥 Detections:  http://localhost:${PORT}/api/fire/detections`);
      console.log(`🔐 Admin Login: http://localhost:${PORT}/api/admin/login`);
      console.log(`📩 Feedback:    http://localhost:${PORT}/api/feedback`);
      console.log(`📤 Export Requests: http://localhost:${PORT}/api/user-requests`);
      console.log("======================================\n");
    });

  } catch (error) {
    console.error(
      "❌ Failed to start Thermal-X server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();