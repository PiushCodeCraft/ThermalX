const express = require("express");
const router = express.Router();

const supabase = require("../supabase");

/*
==================================================
GET ALL USER REQUESTS
==================================================
*/
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user requests",
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: data || [],
    });

  } catch (error) {
    console.error("❌ User requests error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


/*
==================================================
UPDATE REQUEST STATUS
==================================================
*/
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "approved",
      "denied",
      "pending",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const { data, error } = await supabase
      .from("user_requests")
      .update({
        status: status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase update error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update request",
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      data,
    });

  } catch (error) {
    console.error("❌ Status update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


module.exports = router;