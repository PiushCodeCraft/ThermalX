const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined in .env"
      );
    }

    await mongoose.connect(uri, {
      dbName: "ThermalX",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    console.log(
      "✅ MongoDB Atlas connected successfully"
    );

    console.log(
      `📦 MongoDB database: ${mongoose.connection.db.databaseName}`
    );

  } catch (error) {

    console.error(
      "❌ MongoDB connection failed"
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Message:",
      error.message
    );

    if (error.reason) {
      console.error(
        "Reason:",
        error.reason
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;