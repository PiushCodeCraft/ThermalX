const express = require("express");
const router = express.Router();

const supabase = require("../supabase");


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    console.log("🔐 Admin login attempt:", userId);

    // Check email + password in Supabase
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, name, email, password")
      .eq("email", userId.trim())
      .eq("password", password)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase admin login error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to verify admin credentials.",
      });
    }

    // No matching email/password
    if (!data) {
      console.log("❌ Invalid admin credentials");

      return res.status(401).json({
        success: false,
        message: "Invalid user ID or password.",
      });
    }

    console.log("✅ Admin login successful:", data.email);

    // Never send password back to frontend
    const admin = {
      id: data.id,
      name: data.name,
      email: data.email,
    };

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      admin,
    });

  } catch (error) {
    console.error("🔥 Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});


module.exports = router;