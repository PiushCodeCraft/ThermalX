const { spawn } = require("child_process");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});


/* =========================================================
   ENVIRONMENT
========================================================= */

const MONGODB_URI = process.env.MONGODB_URI;

const DATABASE_NAME = "ThermalX";

const COLLECTION_NAME = "firms_raw";


if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is missing in server/.env"
  );
}


/* =========================================================
   PYTHON ML SCRIPT
========================================================= */

const PYTHON_SCRIPT = path.join(
  __dirname,
  "..",
  "predict_new_fire.py"
);


if (!fs.existsSync(PYTHON_SCRIPT)) {
  throw new Error(
    `❌ Python prediction script not found:\n${PYTHON_SCRIPT}`
  );
}


/* =========================================================
   RUN PYTHON MODEL
========================================================= */

function runPythonPrediction(detection) {

  return new Promise((resolve, reject) => {

    const python = spawn(
      "python",
      [PYTHON_SCRIPT]
    );


    let output = "";

    let errorOutput = "";


    /* ---------------------------------------------
       SEND DATA TO PYTHON
    --------------------------------------------- */

    python.stdin.write(
      JSON.stringify(detection)
    );

    python.stdin.end();


    /* ---------------------------------------------
       PYTHON OUTPUT
    --------------------------------------------- */

    python.stdout.on(
      "data",
      (data) => {

        output += data.toString();

      }
    );


    /* ---------------------------------------------
       PYTHON ERROR / LOG
    --------------------------------------------- */

    python.stderr.on(
      "data",
      (data) => {

        const message =
          data.toString();

        errorOutput += message;

        console.log(
          `🐍 ${message.trim()}`
        );

      }
    );


    /* ---------------------------------------------
       PYTHON FINISHED
    --------------------------------------------- */

    python.on(
      "close",
      (code) => {

        if (code !== 0) {

          return reject(
            new Error(
              errorOutput ||
              `Python exited with code ${code}`
            )
          );

        }


        try {

          const result =
            JSON.parse(
              output.trim()
            );


          resolve(result);

        } catch (error) {

          reject(
            new Error(
              `Invalid prediction output from Python:\n${output}`
            )
          );

        }

      }
    );


    /* ---------------------------------------------
       PYTHON PROCESS ERROR
    --------------------------------------------- */

    python.on(
      "error",
      (error) => {

        reject(error);

      }
    );

  });

}


/* =========================================================
   PREDICT NEW FIRE
========================================================= */

async function predictNewFire(
  detection
) {

  let client = null;


  try {

    console.log(
      "\n======================================"
    );

    console.log(
      "🤖 THERMAL-X ML PREDICTION"
    );

    console.log(
      "======================================"
    );


    /* ---------------------------------------------
       PREPARE ML INPUT
    --------------------------------------------- */

    const predictionInput = {

      mongo_detection_id:
        detection._id
          ? detection._id.toString()
          : null,

      latitude:
        Number(
          detection.latitude
        ),

      longitude:
        Number(
          detection.longitude
        ),

      brightness:
        Number(
          detection.brightness
        ),

      bright_t31:
        Number(
          detection.bright_t31
        ),

      frp:
        Number(
          detection.frp
        ),

      scan:
        Number(
          detection.scan
        ),

      track:
        Number(
          detection.track
        ),

      daynight:
        detection.daynight,

      timestamp:
        detection.timestamp ||
        null,

      acq_date:
        detection.acq_date ||
        null,

      acq_time:
        detection.acq_time ||
        null,

    };


    console.log(
      "📥 Sending FIRMS detection to ML model..."
    );


    console.log(
      "📍 Location:",
      predictionInput.latitude,
      predictionInput.longitude
    );


    /* ---------------------------------------------
       RUN PYTHON
    --------------------------------------------- */

    const prediction =
      await runPythonPrediction(
        predictionInput
      );


    console.log(
      "📤 Prediction received:"
    );

    console.log(
      prediction
    );


    /* ---------------------------------------------
       CONNECT TO MONGODB
    --------------------------------------------- */

    client =
      new MongoClient(
        MONGODB_URI
      );

    await client.connect();


    const db =
      client.db(
        DATABASE_NAME
      );


    const collection =
      db.collection(
        COLLECTION_NAME
      );


    /* ---------------------------------------------
       UPDATE SAME FIRMS DOCUMENT
    --------------------------------------------- */

    const updateResult =
      await collection.updateOne(
        {
          _id:
            detection._id,
        },
        {
          $set: {

            prediction:
              prediction.prediction,

            prediction_probability:
              prediction.prediction_probability,

            prediction_label:
              prediction.prediction_label,

            risk_level:
              prediction.risk_level,

            predicted_at:
              new Date(),

            prediction_processed:
              true,

          },
        }
      );


    if (
      updateResult.matchedCount === 0
    ) {

      throw new Error(
        "❌ MongoDB detection document not found"
      );

    }


    /* ---------------------------------------------
       SUCCESS
    --------------------------------------------- */

    console.log(
      "✅ Prediction stored in MongoDB"
    );

    console.log(
      `🔥 Prediction: ${prediction.prediction_label}`
    );

    console.log(
      `📊 Probability: ${prediction.prediction_probability}`
    );

    console.log(
      `⚠️ Risk Level: ${prediction.risk_level}`
    );


    console.log(
      "======================================\n"
    );


    return prediction;


  } catch (error) {

    console.error(
      "❌ ML prediction error:",
      error.message
    );

    throw error;


  } finally {

    if (client) {

      await client.close();

    }

  }

}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  predictNewFire,
};