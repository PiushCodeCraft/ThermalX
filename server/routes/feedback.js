const express = require("express");
const router = express.Router();
const { pool } = require("../postgres");

// =====================================================
// POST FEEDBACK
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and feedback are required.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.feedback
      (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, message, created_at
      `,
      [
        name.trim(),
        email.trim(),
        message.trim(),
      ]
    );

    console.log("✅ Feedback saved:", result.rows[0]);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("❌ Feedback insert error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save feedback.",
    });
  }
});

// =====================================================
// GET ALL FEEDBACK
// =====================================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        message,
        created_at
      FROM public.feedback
      ORDER BY created_at DESC
      `
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("❌ Get feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback.",
    });
  }
});

module.exports = router;