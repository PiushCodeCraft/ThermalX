const express = require("express");
const router = express.Router();

const { pool } = require("../postgres");



// your existing /count route below this
// ==========================================
// FIRE COUNT
// GET /api/fire/count
// ==========================================
router.get("/count", async (req, res) => {
  try {
    const dbInfo = await pool.query(`
      SELECT
        current_user,
        current_database(),
        current_schema(),
        inet_server_addr()
    `);

    const tableInfo = await pool.query(`
      SELECT
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'fire_detections'
    `);

    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.fire_detections
    `);

    res.json({
      success: true,
      database: dbInfo.rows[0],
      table: tableInfo.rows[0],
      count: Number(result.rows[0].count),
    });

  } catch (error) {
    console.error("❌ Fire count error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fire count",
      error: error.message,
    });
  }
});

// ==========================================
// FIRE DETECTIONS
// GET /api/fire/detections
// ==========================================
router.get("/detections", async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit) || 100;

    const limit = Math.min(Math.max(requestedLimit, 1), 1000);

    const result = await pool.query(
      `
      SELECT
        id,
        latitude,
        longitude,
        brightness,
        bright_t31,
        frp,
        scan,
        track,
        daynight,
        hour,
        day,
        month,
        day_of_year,
        day_of_week,
        brightness_difference,
        frp_log
      FROM public.fire_detections
      ORDER BY id
      LIMIT $1
      `,
      [limit]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Fire detections error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fire detections",
      error: error.message,
    });
  }
});

module.exports = router;