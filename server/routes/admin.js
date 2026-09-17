const express = require("express");
const router = express.Router();

const supabase = require("../supabase");
const { MongoClient } = require("mongodb");


// =====================================================
// CONFIGURATION
// =====================================================

const MONGODB_URI = process.env.MONGODB_URI;

const DATABASE_NAME = "ThermalX";
const COLLECTION_NAME = "firms_raw";


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    console.log(
      "🔐 Admin login attempt:",
      userId
    );


    // -------------------------------------------------
    // CHECK ADMIN IN SUPABASE
    // -------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from("admin_users")
      .select(
        "id, name, email, password"
      )
      .eq(
        "email",
        userId.trim()
      )
      .eq(
        "password",
        password
      )
      .maybeSingle();


    // -------------------------------------------------
    // SUPABASE ERROR
    // -------------------------------------------------

    if (error) {

      console.error(
        "❌ Supabase admin login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to verify admin credentials.",
      });
    }


    // -------------------------------------------------
    // INVALID CREDENTIALS
    // -------------------------------------------------

    if (!data) {

      console.log(
        "❌ Invalid admin credentials"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid user ID or password.",
      });
    }


    // -------------------------------------------------
    // ADMIN OBJECT
    // -------------------------------------------------

    const admin = {
      id: data.id,
      name: data.name,
      email: data.email,
    };


    console.log(
      "✅ Admin login successful:",
      data.email
    );


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Admin login successful.",
      admin,
    });

  } catch (error) {

    console.error(
      "🔥 Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error.",
    });
  }
});


// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  async (req, res) => {

    let client = null;

    try {

      console.log(
        "\n📊 Admin dashboard request received"
      );


      // =================================================
      // CHECK MONGODB URI
      // =================================================

      if (!MONGODB_URI) {

        console.error(
          "❌ MONGODB_URI is missing"
        );

        return res.status(500).json({
          success: false,
          message:
            "MONGODB_URI is missing.",
        });
      }


      // =================================================
      // CONNECT TO MONGODB
      // =================================================

      client =
        new MongoClient(
          MONGODB_URI
        );

      await client.connect();

      console.log(
        "✅ Dashboard MongoDB connected"
      );


      // =================================================
      // DATABASE + COLLECTION
      // =================================================

      const db =
        client.db(
          DATABASE_NAME
        );

      const collection =
        db.collection(
          COLLECTION_NAME
        );


      // =================================================
      // DATE REFERENCES
      // =================================================

      const now =
        new Date();


      const last24Hours =
        new Date(
          now.getTime() -
          24 *
          60 *
          60 *
          1000
        );


      const startOfToday =
        new Date();

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );


      // =================================================
      // 1. ACTIVE INCIDENTS
      // =================================================
      //
      // Active incidents are detections whose
      // predicted risk is HIGH or CRITICAL.
      //
      // =================================================

      const activeIncidents =
        await collection.countDocuments({
          prediction_processed: true,

          risk_level: {
            $in: [
              "HIGH",
              "CRITICAL",
            ],
          },
        });


      // =================================================
      // 2. THERMAL DETECTIONS
      // =================================================
      //
      // All FIRMS detections collected during
      // the last 24 hours.
      //
      // =================================================

      const thermalDetections =
        await collection.countDocuments({
          collected_at: {
            $gte: last24Hours,
          },
        });


      // =================================================
      // 3. AI ANALYSES
      // =================================================
      //
      // Predictions completed today.
      //
      // =================================================

      const aiAnalyses =
        await collection.countDocuments({
          prediction_processed: true,

          predicted_at: {
            $gte: startOfToday,
          },
        });


      // =================================================
      // 4. REGISTERED USERS
      // =================================================

      let registeredUsers = 0;


      try {

        const {
          count,
          error: usersError,
        } =
          await supabase
            .from("users")
            .select(
              "*",
              {
                count: "exact",
                head: true,
              }
            );


        if (usersError) {

          console.log(
            "⚠️ Users table unavailable:",
            usersError.message
          );

        } else {

          registeredUsers =
            count || 0;
        }

      } catch (userError) {

        console.log(
          "⚠️ Registered users query failed:",
          userError.message
        );
      }


      // =================================================
      // 5. RECENT INCIDENTS
      // =================================================
      //
      // Get the latest predicted FIRMS detections.
      //
      // =================================================

      const recentIncidents =
        await collection
          .find(
            {
              prediction_processed: true,
            },
            {
              projection: {
                _id: 1,

                latitude: 1,
                longitude: 1,

                risk_level: 1,

                prediction: 1,
                prediction_label: 1,
                prediction_probability: 1,

                predicted_at: 1,

                collected_at: 1,

                acq_date: 1,
                acq_time: 1,

                brightness: 1,
                frp: 1,

                satellite: 1,
                instrument: 1,

                confidence: 1,
              },
            }
          )
          .sort({
            predicted_at: -1,
            collected_at: -1,
          })
          .limit(10)
          .toArray();


      // =================================================
      // 6. RECENT AI ACTIVITY
      // =================================================
      //
      // Latest AI prediction activities.
      //
      // =================================================

      const recentActivities =
        await collection
          .find(
            {
              prediction_processed: true,
            },
            {
              projection: {
                _id: 1,

                prediction: 1,

                prediction_label: 1,

                prediction_probability: 1,

                risk_level: 1,

                predicted_at: 1,

                latitude: 1,
                longitude: 1,
              },
            }
          )
          .sort({
            predicted_at: -1,
          })
          .limit(10)
          .toArray();


      // =================================================
      // 7. SYSTEM STATUS
      // =================================================

      const totalRecords =
        await collection.countDocuments();


      const processedRecords =
        await collection.countDocuments({
          prediction_processed: true,
        });


      const recentFirmsRecords =
        await collection.countDocuments({
          collected_at: {
            $gte: last24Hours,
          },
        });


      const systemStatus = {

        // NASA FIRMS
        nasaFirms:
          recentFirmsRecords > 0
            ? "AVAILABLE"
            : "NOT AVAILABLE",


        // AI MODEL
        aiDetection:
          processedRecords > 0
            ? "AVAILABLE"
            : "NOT AVAILABLE",


        // COLLECTOR
        thermalCollector:
          totalRecords > 0
            ? "AVAILABLE"
            : "NOT AVAILABLE",


        // ALERT PROCESSING
        alertProcessing:
          processedRecords > 0
            ? "AVAILABLE"
            : "NOT AVAILABLE",


        // DATABASE
        database:
          "CONNECTED",


        // OVERALL
        operational:
          true,
      };


      // =================================================
      // DASHBOARD DATA
      // =================================================

      const dashboardData = {

        // -------------------------------
        // STATISTICS
        // -------------------------------

        activeIncidents,

        thermalDetections,

        aiAnalyses,

        registeredUsers,


        // -------------------------------
        // SYSTEM
        // -------------------------------

        systemStatus,


        // -------------------------------
        // RECENT DATA
        // -------------------------------

        recentIncidents,

        recentActivity:
          recentActivities,
      };


      // =================================================
      // CONSOLE
      // =================================================

      console.log(
        "\n======================================"
      );

      console.log(
        "📊 ADMIN DASHBOARD DATA"
      );

      console.log(
        "======================================"
      );

      console.log(
        `🚨 Active incidents    : ${activeIncidents}`
      );

      console.log(
        `🔥 Thermal detections  : ${thermalDetections}`
      );

      console.log(
        `🧠 AI analyses         : ${aiAnalyses}`
      );

      console.log(
        `👥 Registered users    : ${registeredUsers}`
      );

      console.log(
        `📍 Recent incidents    : ${recentIncidents.length}`
      );

      console.log(
        `🤖 Recent AI activity : ${recentActivities.length}`
      );

      console.log(
        "======================================"
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        data: dashboardData,

      });

    } catch (error) {

      // =================================================
      // ERROR
      // =================================================

      console.error(
        "\n❌ Dashboard API error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Unable to retrieve dashboard data.",

        error:
          error.message,

      });

    } finally {

      // =================================================
      // CLOSE MONGODB
      // =================================================

      if (client) {

        await client.close();

        console.log(
          "🔌 Dashboard MongoDB connection closed"
        );
      }
    }
  }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;