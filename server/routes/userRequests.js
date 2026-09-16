const express = require("express");
const router = express.Router();

const { pool } = require("../postgres");

// =====================================================
// CREATE EXPORT REQUEST
// =====================================================

router.post("/", async (req, res) => {
  console.log("\n======================================");
  console.log("📤 EXPORT REQUEST RECEIVED");
  console.log("======================================");
  console.log("Request body:", req.body);

  try {
    const { name, email, reason } = req.body;

    // Validation
    if (!name || !email || !reason) {
      return res.status(400).json({
        success: false,
        message: "Name, email and reason are required.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.user_requests
      (
        name,
        email,
        reason
      )
      VALUES ($1, $2, $3)
      RETURNING id, name, email, reason, created_at
      `,
      [
        name.trim(),
        email.trim(),
        reason.trim(),
      ]
    );

    console.log("✅ Export request saved:");
    console.log(result.rows[0]);
    console.log("======================================\n");

    res.status(201).json({
      success: true,
      message: "Export request submitted successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("❌ EXPORT REQUEST DATABASE ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save export request.",
      error: error.message,
    });
  }
});


// =====================================================
// GET ALL USER REQUESTS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        reason,
        created_at
      FROM public.user_requests
      ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("❌ GET USER REQUESTS ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user requests.",
    });
  }
});


module.exports = router;