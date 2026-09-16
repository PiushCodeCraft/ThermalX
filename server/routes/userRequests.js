const express = require("express");
const router = express.Router();

const supabase = require("../supabase");


// =====================================================
// CREATE USER REQUEST
// POST /api/user-requests
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { name, email, reason } = req.body;

    if (!name || !email || !reason) {
      return res.status(400).json({
        success: false,
        message: "Name, email and reason are required.",
      });
    }

    console.log("📤 New export request:", {
      name,
      email,
      reason,
    });

    const { data, error } = await supabase
      .from("user_requests")
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          reason: reason.trim(),
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(
        "❌ Supabase user request error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    console.log(
      "✅ Export request saved to Supabase:",
      data.id
    );

    return res.status(201).json({
      success: true,
      message: "Export request submitted successfully.",
      data,
    });

  } catch (error) {
    console.error(
      "🔥 User request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


// =====================================================
// GET ALL REQUESTS
// GET /api/user-requests
// =====================================================

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_requests")
      .select(
        "id, name, email, reason, status, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "❌ Supabase request fetch error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(
      "🔥 Get requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


// =====================================================
// APPROVE REQUEST
// PATCH /api/user-requests/:id/approve
// =====================================================

router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("user_requests")
      .update({
        status: "approved",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "❌ Supabase approval error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    console.log(
      "✅ Request approved:",
      id
    );

    return res.status(200).json({
      success: true,
      message: "Request approved successfully.",
      data,
    });

  } catch (error) {
    console.error(
      "🔥 Approval error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


// =====================================================
// REJECT REQUEST
// PATCH /api/user-requests/:id/reject
// =====================================================

router.patch("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("user_requests")
      .update({
        status: "rejected",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(
        "❌ Supabase rejection error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully.",
      data,
    });

  } catch (error) {
    console.error(
      "🔥 Rejection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


module.exports = router;