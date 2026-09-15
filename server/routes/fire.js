const express = require("express");
const router = express.Router();

const { pool } = require("../postgres");


// =====================================================
// GET TOTAL FIRE DETECTIONS
// =====================================================

router.get("/count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM public.fire_detections"
    );

    res.json({
      success: true,
      count: Number(result.rows[0].count),
    });

  } catch (error) {
    console.error("❌ Fire detection count error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


// =====================================================
// GET FIRE DETECTIONS
// =====================================================

router.get("/detections", async (req, res) => {
  try {

    const limit = Math.min(
      Number(req.query.limit) || 100,
      1000
    );

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
        confidence,
        daynight,
        timestamp,
        hour,
        day,
        month,
        day_of_year,
        brightness_difference,
        frp_log,
        day_of_week
      FROM public.fire_detections
      ORDER BY timestamp DESC
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

    console.error(
      "❌ Fire detection fetch error:",
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


module.exports = router;