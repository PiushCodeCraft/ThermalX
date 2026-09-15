const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectMongoDB = require("./db");
// const connectPostgreSQL = require("./postgres");

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
// SERVER START
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    // Connect MongoDB Atlas
    await connectMongoDB();

    // Connect PostgreSQL
    // await connectPostgreSQL();

    app.listen(PORT, () => {
      console.log(`Thermal-X server running on port ${PORT}`);
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