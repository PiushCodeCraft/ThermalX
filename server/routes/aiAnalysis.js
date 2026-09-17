const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

/*
==================================================
MONGODB COLLECTION
==================================================
*/

const getCollection = () => {
  return mongoose.connection
    .db
    .collection("firms_raw");
};


/*
==================================================
GET AI STATUS
==================================================
*/

router.get("/status", async (req, res) => {
  try {
    const collection = getCollection();

    const latest = await collection
      .find({
        preprocessed: true,
        prediction_processed: true,
      })
      .sort({
        predicted_at: -1,
      })
      .limit(1)
      .toArray();

    const latestRecord = latest[0] || null;

    const analysesToday = await collection.countDocuments({
      preprocessed: true,
      prediction_processed: true,
      predicted_at: {
        $gte: new Date(
          new Date().setHours(0, 0, 0, 0)
        ),
      },
    });

    res.json({
      success: true,

      data: {
        status: latestRecord
          ? "ONLINE"
          : "READY",

        processing: latestRecord
          ? "ACTIVE"
          : "IDLE",

        analysesToday,

        lastUpdate:
          latestRecord?.predicted_at ||
          latestRecord?.collected_at ||
          null,
      },
    });

  } catch (error) {
    console.error(
      "❌ AI status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get AI status",
      error: error.message,
    });
  }
});


/*
==================================================
GET ALL AI ANALYSES
==================================================
*/

router.get("/", async (req, res) => {
  try {
    const collection = getCollection();

    const records = await collection
      .find({
        preprocessed: true,
        prediction_processed: true,
      })
      .sort({
        predicted_at: -1,
      })
      .limit(100)
      .toArray();

    const analyses = records.map((record) => ({
      id:
        record.observation_key ||
        record._id.toString(),

      location: `${Number(
        record.latitude
      ).toFixed(5)}, ${Number(
        record.longitude
      ).toFixed(5)}`,

      latitude: record.latitude,

      longitude: record.longitude,

      confidence:
        record.prediction_probability ?? 0,

      classification:
        record.prediction_label ||
        "Unknown",

      prediction:
        record.prediction ?? null,

      status:
        record.risk_level ||
        "UNKNOWN",

      time:
        record.predicted_at ||
        record.collected_at ||
        null,

      /*
      Additional thermal information
      */

      brightness:
        record.brightness ?? null,

      bright_t31:
        record.bright_t31 ?? null,

      brightness_difference:
        record.brightness_difference ?? null,

      frp:
        record.frp ?? null,

      frp_log:
        record.frp_log ?? null,

      daynight:
        record.daynight ?? null,

      satellite:
        record.satellite ?? null,

      instrument:
        record.instrument ?? null,

      confidence_source:
        record.confidence ?? null,
    }));


    res.json({
      success: true,
      analyses,
    });

  } catch (error) {
    console.error(
      "❌ AI analyses error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch AI analyses",
      error: error.message,
    });
  }
});


/*
==================================================
GET SINGLE AI ANALYSIS
==================================================
*/

router.get("/:id", async (req, res) => {
  try {
    const collection = getCollection();

    const id = req.params.id;

    let record = await collection.findOne({
      observation_key: id,
    });

    /*
    If observation_key was not found,
    try MongoDB ObjectId.
    */

    if (!record && mongoose.Types.ObjectId.isValid(id)) {
      record = await collection.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "AI analysis not found",
      });
    }


    const analysis = {
      id:
        record.observation_key ||
        record._id.toString(),

      location: `${Number(
        record.latitude
      ).toFixed(5)}, ${Number(
        record.longitude
      ).toFixed(5)}`,

      latitude: record.latitude,

      longitude: record.longitude,

      confidence:
        record.prediction_probability ?? 0,

      classification:
        record.prediction_label ||
        "Unknown",

      prediction:
        record.prediction ?? null,

      status:
        record.risk_level ||
        "UNKNOWN",

      time:
        record.predicted_at ||
        record.collected_at ||
        null,

      brightness:
        record.brightness ?? null,

      bright_t31:
        record.bright_t31 ?? null,

      brightness_difference:
        record.brightness_difference ?? null,

      frp:
        record.frp ?? null,

      frp_log:
        record.frp_log ?? null,

      daynight:
        record.daynight ?? null,

      satellite:
        record.satellite ?? null,

      instrument:
        record.instrument ?? null,

      acq_date:
        record.acq_date ?? null,

      acq_time:
        record.acq_time ?? null,

      raw: record,
    };


    res.json({
      success: true,
      data: analysis,
    });

  } catch (error) {
    console.error(
      "❌ AI analysis detail error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch AI analysis",
      error: error.message,
    });
  }
});


module.exports = router;