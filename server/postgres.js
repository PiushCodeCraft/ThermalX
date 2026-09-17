const { Pool } = require("pg");


// =====================================================
// LOCAL POSTGRESQL CONNECTION
// =====================================================

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});


// =====================================================
// CONNECTION EVENT
// =====================================================

pool.on("connect", () => {

  console.log(
    "✅ Local PostgreSQL connected"
  );

});


// =====================================================
// ERROR EVENT
// =====================================================

pool.on("error", (error) => {

  console.error(
    "❌ PostgreSQL pool error:",
    error.message
  );

});


// =====================================================
// VERIFY CONNECTION
// =====================================================

const connectPostgreSQL = async () => {

  try {

    const client = await pool.connect();

    console.log(
      "✅ Local PostgreSQL connection verified"
    );

    client.release();

  } catch (error) {
    console.warn("⚠️ PostgreSQL connection failed (continuing with MongoDB):", error.message);
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  pool,
  connectPostgreSQL,
};