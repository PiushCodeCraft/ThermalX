const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./db");
const { connectPostgreSQL } = require("./postgres");
const fireRoutes = require("./routes/fire");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Thermal-X API is running",
  });
});

app.use("/api/fire", fireRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await connectPostgreSQL();

    app.listen(PORT, () => {
      console.log("");
      console.log("======================================");
      console.log("🔥 THERMAL-X API");
      console.log("======================================");
      console.log(`🌐 Backend: http://localhost:${PORT}`);
      console.log(
        `🔥 Fire Count: http://localhost:${PORT}/api/fire/count`
      );
      console.log(
        `📍 Detections: http://localhost:${PORT}/api/fire/detections`
      );
      console.log("======================================");
    });
  } catch (error) {
    console.error("❌ Failed to start Thermal-X server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();