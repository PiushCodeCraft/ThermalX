const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");


/*
==================================================
GET ALL INCIDENTS
==================================================
*/

router.get("/", async (req, res) => {
  try {

    const collection =
      mongoose.connection.db.collection("firms_raw");

    const records = await collection
      .find({
        preprocessed: true,
      })
      .sort({
        collected_at: -1,
      })
      .limit(200)
      .toArray();

    const incidents = records.map((record) => {

      const probability =
        Number(
          record.prediction_probability ?? 0
        );

      let risk =
        record.risk_level;

      if (!risk) {
        if (probability >= 0.70) {
          risk = "HIGH";
        } else if (probability >= 0.40) {
          risk = "MEDIUM";
        } else {
          risk = "LOW";
        }
      }

      let severity = "Low";

      if (risk === "HIGH") {
        severity = "High";
      } else if (risk === "MEDIUM") {
        severity = "Medium";
      }

      return {
        id:
          record.observation_key ||
          record._id.toString(),

        latitude:
          Number(record.latitude),

        longitude:
          Number(record.longitude),

        location:
          `${Number(record.latitude).toFixed(5)}, ${Number(
            record.longitude
          ).toFixed(5)}`,

        brightness:
          record.brightness ?? null,

        bright_t31:
          record.bright_t31 ?? null,

        brightness_difference:
          record.brightness_difference ?? null,

        frp:
          record.frp ?? null,

        satellite:
          record.satellite ?? "N21",

        instrument:
          record.instrument ?? "VIIRS",

        confidence:
          record.confidence ?? null,

        acq_date:
          record.acq_date ?? null,

        acq_time:
          record.acq_time ?? null,

        daynight:
          record.daynight ?? null,

        prediction:
          record.prediction ?? null,

        prediction_probability:
          probability,

        prediction_label:
          record.prediction_label ||
          "Unknown",

        risk_level:
          risk,

        severity:
          severity,

        collected_at:
          record.collected_at ?? null,

        predicted_at:
          record.predicted_at ?? null,

        preprocessed:
          record.preprocessed ?? false,

        prediction_processed:
          record.prediction_processed ?? false,
      };
    });

    res.json({
      success: true,
      count: incidents.length,
      data: incidents,
    });

  } catch (error) {

    console.error(
      "❌ MongoDB incidents error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch incidents from MongoDB",
      error: error.message,
    });
  }
});


/*
==================================================
DEBUG MONGODB
==================================================
*/

router.get("/debug", async (req, res) => {
  try {

    const db =
      mongoose.connection.db;

    const collections =
      await db
        .listCollections()
        .toArray();

    const collectionNames =
      collections.map(
        (c) => c.name
      );

    const collection =
      db.collection("firms_raw");

    const total =
      await collection.countDocuments({});

    const preprocessed =
      await collection.countDocuments({
        preprocessed: true,
      });

    const predicted =
      await collection.countDocuments({
        prediction_processed: true,
      });

    const sample =
      await collection
        .find({})
        .sort({
          collected_at: -1,
        })
        .limit(3)
        .toArray();

    res.json({
      success: true,

      database:
        db.databaseName,

      collections:
        collectionNames,

      firms_raw_total:
        total,

      preprocessed_total:
        preprocessed,

      prediction_processed_total:
        predicted,

      sample,
    });

  } catch (error) {

    console.error(
      "❌ MongoDB debug error:",
      error
    );

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


/*
==================================================
GET SINGLE INCIDENT
==================================================
*/

router.get("/:id", async (req, res) => {

  try {

    const collection =
      mongoose.connection.db.collection(
        "firms_raw"
      );

    const id =
      req.params.id;

    let record =
      await collection.findOne({
        observation_key: id,
      });

    if (
      !record &&
      mongoose.Types.ObjectId.isValid(id)
    ) {

      record =
        await collection.findOne({
          _id:
            new mongoose.Types.ObjectId(id),
        });

    }

    if (!record) {

      return res.status(404).json({
        success: false,
        message:
          "Incident not found",
      });

    }

    const probability =
      Number(
        record.prediction_probability ?? 0
      );

    let risk =
      record.risk_level || "LOW";

    let severity = "Low";

    if (risk === "HIGH") {
      severity = "High";
    } else if (risk === "MEDIUM") {
      severity = "Medium";
    }

    res.json({
      success: true,

      data: {
        id:
          record.observation_key ||
          record._id.toString(),

        latitude:
          Number(record.latitude),

        longitude:
          Number(record.longitude),

        location:
          `${Number(record.latitude).toFixed(5)}, ${Number(
            record.longitude
          ).toFixed(5)}`,

        brightness:
          record.brightness ?? null,

        bright_t31:
          record.bright_t31 ?? null,

        brightness_difference:
          record.brightness_difference ?? null,

        frp:
          record.frp ?? null,

        prediction:
          record.prediction ?? null,

        prediction_probability:
          probability,

        prediction_label:
          record.prediction_label ||
          "Unknown",

        risk_level:
          risk,

        severity:
          severity,

        satellite:
          record.satellite ?? "N21",

        instrument:
          record.instrument ?? "VIIRS",

        confidence:
          record.confidence ?? null,

        acq_date:
          record.acq_date ?? null,

        acq_time:
          record.acq_time ?? null,

        daynight:
          record.daynight ?? null,

        collected_at:
          record.collected_at ?? null,

        predicted_at:
          record.predicted_at ?? null,

        raw:
          record,
      },
    });

  } catch (error) {

    console.error(
      "❌ Incident detail error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch incident",
      error: error.message,
    });
  }
});


module.exports = router;