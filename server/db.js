const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    // Never print the password
    const safeUri = uri.replace(
      /\/\/([^:]+):([^@]+)@/,
      "//$1:****@"
    );

    console.log("MongoDB URI:", safeUri);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }

    process.exit(1);
  }
};

module.exports = connectDB;