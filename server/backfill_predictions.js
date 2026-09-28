const { MongoClient } = require("mongodb");
require("dotenv").config();

const { predictNewFire } = require("./services/predictionService");

const MONGODB_URI = process.env.MONGODB_URI;

const DATABASE_NAME = "ThermalX";
const COLLECTION_NAME = "firms_raw";

async function backfillPredictions() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("==============================================");
    console.log("THERMAL-X : PREDICTION BACKFILL");
    console.log("==============================================");

    await client.connect();

    console.log("✅ MongoDB connected");

    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const records = await collection
      .find({
        $or: [
          { prediction_processed: { $exists: false } },
          { prediction_processed: { $ne: true } }
        ]
      })
      .toArray();

    console.log(
      `📌 Records requiring prediction: ${records.length}`
    );

    if (records.length === 0) {
      console.log("✅ No records require backfill.");
      return;
    }

    let completed = 0;
    let failed = 0;

    for (const record of records) {
      try {
        console.log(
          `\n🔄 Processing ${completed + failed + 1}/${records.length}`
        );

        console.log(
          `   Location: ${record.latitude}, ${record.longitude}`
        );

        const prediction = await predictNewFire({
          ...record,
          mongo_detection_id: record._id.toString()
        });

        await collection.updateOne(
          { _id: record._id },
          {
            $set: {
              prediction: prediction.prediction,
              prediction_probability:
                prediction.prediction_probability,
              prediction_label:
                prediction.prediction_label,
              risk_level:
                prediction.risk_level,
              predicted_at: new Date(),
              prediction_processed: true
            }
          }
        );

        completed++;

        console.log(
          `   ✅ ${prediction.prediction_label} | ` +
          `${(
            prediction.prediction_probability * 100
          ).toFixed(2)}% | ` +
          `${prediction.risk_level}`
        );

      } catch (error) {
        failed++;

        console.error(
          `   ❌ Prediction failed: ${error.message}`
        );
      }
    }

    console.log("\n==============================================");
    console.log("BACKFILL COMPLETE");
    console.log("==============================================");

    console.log(`Total records : ${records.length}`);
    console.log(`Completed     : ${completed}`);
    console.log(`Failed        : ${failed}`);

  } catch (error) {
    console.error("\n❌ Backfill error:", error.message);

  } finally {
    await client.close();
    console.log("\n🔌 MongoDB connection closed");
  }
}

backfillPredictions();