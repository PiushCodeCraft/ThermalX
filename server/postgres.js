const { Pool } = require("pg");


// =====================================================
// LOCAL POSTGRESQL CONNECTION
// =====================================================

const pool = new Pool({

  connectionString: process.env.DATABASE_URL,

  // Local PostgreSQL does NOT use SSL
  ssl: false,

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

    console.error(
      "❌ PostgreSQL connection failed:"
    );

    console.error(
      error.message
    );

    throw error;

  }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  pool,
  connectPostgreSQL,
};