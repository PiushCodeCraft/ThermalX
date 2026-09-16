const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

const connectPostgreSQL = async () => {
  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL connection verified");

    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:");
    console.error(error.message);

    throw error;
  }
};

module.exports = {
  pool,
  connectPostgreSQL,
};