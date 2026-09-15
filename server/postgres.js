const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error("❌ PostgreSQL pool error:", err);
});

const connectPostgreSQL = async () => {
    try {
        const client = await pool.connect();

        await client.query("SELECT NOW()");

        client.release();

        console.log("✅ PostgreSQL database is ready");

    } catch (error) {
        console.error("❌ PostgreSQL connection failed:");
        console.error(error.message);
    }
};

module.exports = connectPostgreSQL;
module.exports.pool = pool;