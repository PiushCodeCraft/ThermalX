const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./db");
const { connectPostgreSQL } = require("./postgres");

// Fire detection routes
const fireRoutes = require("./routes/fire");

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
// FIRE DETECTION API ROUTES
// =====================================================

app.use("/api/fire", fireRoutes);

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB Atlas
    await connectMongoDB();

    // Connect PostgreSQL / Supabase
    await connectPostgreSQL();

    app.listen(PORT, () => {
      console.log(`Thermal-X server running on port ${PORT}`);

      console.log("\n======================================");
      console.log("🔥 THERMAL-X API");
      console.log("======================================");
      console.log(`🌐 Backend:     http://localhost:${PORT}`);
      console.log(`📊 Fire Count:  http://localhost:${PORT}/api/fire/count`);
      console.log(`🔥 Detections:  http://localhost:${PORT}/api/fire/detections`);
      console.log("======================================\n");
    });

  } catch (error) {
    console.error(
      "Failed to start Thermal-X server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();