const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    console.log("📩 Feedback received:", {
      name,
      email,
      message,
    });

    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase INSERT error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    console.log("✅ Feedback saved:", data);

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data,
    });
  } catch (error) {
    console.error("❌ Feedback API error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
});

// GET /api/feedback
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("id, name, email, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase SELECT error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Feedback GET error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
});

module.exports = router;