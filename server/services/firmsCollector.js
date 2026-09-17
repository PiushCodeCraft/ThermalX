const { MongoClient } = require("mongodb");
const { parse } = require("csv-parse/sync");
const crypto = require("crypto");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const {
  predictNewFire,
} = require("./predictionService");


/* =========================================================
   ENVIRONMENT
========================================================= */

const MONGODB_URI =
  process.env.MONGODB_URI;

const NASA_MAP_KEY =
  process.env.NASA_FIRMS_MAP_KEY;


if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is missing in server/.env"
  );
}


if (!NASA_MAP_KEY) {
  throw new Error(
    "❌ NASA_FIRMS_MAP_KEY is missing in server/.env"
  );
}


/* =========================================================
   CONFIGURATION
========================================================= */

const AREA = "68,8,97,35";

const SOURCE =
  "VIIRS_NOAA21_NRT";

const DAY_RANGE = "1";

const DATABASE_NAME =
  "ThermalX";

const COLLECTION_NAME =
  "firms_raw";

const COLLECTION_INTERVAL =
  15 * 60 * 1000;


/* =========================================================
   ML FEATURES
========================================================= */

const FEATURES = [
  "brightness_difference",
  "latitude",
  "longitude",
  "frp",
  "day_of_year",
  "brightness",
  "scan",
  "bright_t31",
  "day",
  "track",
  "day_of_week",
  "frp_log",
  "hour",
  "month",
  "daynight",
];


/* =========================================================
   INDIA LOCATION FILTER
========================================================= */

/*
   No GeoJSON is required.

   This removes points clearly outside
   the India geographic region.

   Latitude:
   8° - 37°

   Longitude:
   68° - 97°
*/

function isPointInsideIndia(
  latitude,
  longitude
) {

  const lat =
    Number(latitude);

  const lon =
    Number(longitude);


  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {

    return false;
  }


  return (
    lat >= 8 &&
    lat <= 37 &&
    lon >= 68 &&
    lon <= 97
  );
}


/* =========================================================
   SAFE NUMBER
========================================================= */

function toNumber(value) {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {

    return null;
  }


  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return null;
  }


  return number;
}


/* =========================================================
   OBSERVATION KEY
========================================================= */

function createObservationKey(
  record
) {

  const rawKey = [
    record.satellite,
    record.instrument,
    record.acq_date,
    record.acq_time,
    record.latitude,
    record.longitude,
    record.version,
  ].join("|");


  return crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");
}


/* =========================================================
   DATE FEATURES
========================================================= */

function calculateDateFeatures(
  acqDate
) {

  const dateString =
    String(
      acqDate || ""
    ).trim();


  if (!dateString) {

    return null;
  }


  const date =
    new Date(
      `${dateString}T00:00:00Z`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;
  }


  const day =
    date.getUTCDate();


  const month =
    date.getUTCMonth() + 1;


  const dayOfWeek =
    date.getUTCDay();


  const startOfYear =
    new Date(
      Date.UTC(
        date.getUTCFullYear(),
        0,
        1
      )
    );


  const dayOfYear =
    Math.floor(
      (
        date.getTime() -
        startOfYear.getTime()
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    ) + 1;


  return {
    day,
    month,
    day_of_week:
      dayOfWeek,
    day_of_year:
      dayOfYear,
  };
}


/* =========================================================
   ACQUISITION HOUR
========================================================= */

function extractHour(
  acqTime
) {

  if (
    acqTime === undefined ||
    acqTime === null
  ) {

    return null;
  }


  const value =
    String(acqTime)
      .trim()
      .padStart(4, "0");


  if (
    !/^\d{4}$/.test(value)
  ) {

    return null;
  }


  const hour =
    Number(
      value.substring(0, 2)
    );


  if (
    !Number.isFinite(hour) ||
    hour < 0 ||
    hour > 23
  ) {

    return null;
  }


  return hour;
}


/* =========================================================
   DAY / NIGHT
========================================================= */

function convertDayNight(
  value
) {

  const raw =
    String(
      value || ""
    )
      .trim()
      .toUpperCase();


  if (raw === "D") {

    return 1;
  }


  if (raw === "N") {

    return 0;
  }


  return null;
}


/* =========================================================
   PREPROCESS NASA FIRMS RECORD
========================================================= */

function preprocessRecord(
  record
) {

  const latitude =
    toNumber(
      record.latitude
    );


  const longitude =
    toNumber(
      record.longitude
    );


  const brightness =
    toNumber(
      record.bright_ti4
    );


  const brightT31 =
    toNumber(
      record.bright_ti5
    );


  const frp =
    toNumber(
      record.frp
    );


  const scan =
    toNumber(
      record.scan
    );


  const track =
    toNumber(
      record.track
    );


  /* ---------------------------------------------
     VALIDATION
  --------------------------------------------- */

  if (
    latitude === null
  ) {

    return {
      valid: false,
      reason: "latitude",
    };
  }


  if (
    longitude === null
  ) {

    return {
      valid: false,
      reason: "longitude",
    };
  }


  if (
    brightness === null
  ) {

    return {
      valid: false,
      reason: "bright_ti4",
    };
  }


  if (
    brightT31 === null
  ) {

    return {
      valid: false,
      reason: "bright_ti5",
    };
  }


  if (
    frp === null
  ) {

    return {
      valid: false,
      reason: "frp",
    };
  }


  if (
    scan === null
  ) {

    return {
      valid: false,
      reason: "scan",
    };
  }


  if (
    track === null
  ) {

    return {
      valid: false,
      reason: "track",
    };
  }


  /* ---------------------------------------------
     DATE FEATURES
  --------------------------------------------- */

  const dateFeatures =
    calculateDateFeatures(
      record.acq_date
    );


  if (!dateFeatures) {

    return {
      valid: false,
      reason: "acq_date",
    };
  }


  /* ---------------------------------------------
     HOUR
  --------------------------------------------- */

  const hour =
    extractHour(
      record.acq_time
    );


  if (
    hour === null
  ) {

    return {
      valid: false,
      reason: "acq_time",
    };
  }


  /* ---------------------------------------------
     DAY / NIGHT
  --------------------------------------------- */

  const daynight =
    convertDayNight(
      record.daynight
    );


  if (
    daynight === null
  ) {

    return {
      valid: false,
      reason: "daynight",
    };
  }


  /* ---------------------------------------------
     DERIVED FEATURES
  --------------------------------------------- */

  const brightnessDifference =
    brightness -
    brightT31;


  const frpLog =
    Math.log1p(
      Math.max(
        frp,
        0
      )
    );


  /* ---------------------------------------------
     FEATURES
  --------------------------------------------- */

  const features = {

    brightness_difference:
      brightnessDifference,

    latitude,

    longitude,

    frp,

    day_of_year:
      dateFeatures.day_of_year,

    brightness,

    scan,

    bright_t31:
      brightT31,

    day:
      dateFeatures.day,

    track,

    day_of_week:
      dateFeatures.day_of_week,

    frp_log:
      frpLog,

    hour,

    month:
      dateFeatures.month,

    daynight,
  };


  return {
    valid: true,
    features,
  };
}


/* =========================================================
   FETCH NASA FIRMS DATA
========================================================= */

async function fetchFirmsData() {

  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${NASA_MAP_KEY}/` +
    `${SOURCE}/` +
    `${AREA}/` +
    `${DAY_RANGE}`;


  console.log(
    "\n======================================"
  );

  console.log(
    "🔥 NASA FIRMS COLLECTION"
  );

  console.log(
    "======================================"
  );

  console.log(
    `Source: ${SOURCE}`
  );

  console.log(
    `Area: ${AREA}`
  );

  console.log(
    `Day range: ${DAY_RANGE}`
  );

  console.log(
    "Fetching NASA FIRMS data..."
  );


  const response =
    await fetch(url);


  if (
    !response.ok
  ) {

    throw new Error(
      `NASA FIRMS request failed: ${response.status} ${response.statusText}`
    );
  }


  const csvText =
    await response.text();


  if (
    !csvText ||
    csvText.trim().length === 0
  ) {

    throw new Error(
      "NASA FIRMS returned empty data"
    );
  }


  return csvText;
}


/* =========================================================
   CONNECT MONGODB
========================================================= */

async function connectMongo() {

  const client =
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


  return {
    client,
    collection,
  };
}


/* =========================================================
   MONGODB INDEXES
========================================================= */

async function ensureIndexes(
  collection
) {

  await collection.createIndex(
    {
      observation_key: 1,
    },
    {
      unique: true,
      name:
        "unique_observation_key",
    }
  );


  await collection.createIndex(
    {
      prediction_processed: 1,
    },
    {
      name:
        "prediction_processed_index",
    }
  );


  await collection.createIndex(
    {
      collected_at: -1,
    },
    {
      name:
        "collected_at_index",
    }
  );


  await collection.createIndex(
    {
      latitude: 1,
      longitude: 1,
    },
    {
      name:
        "coordinates_index",
    }
  );


  console.log(
    "✅ MongoDB indexes verified"
  );
}


/* =========================================================
   SAVE DATA
========================================================= */

async function saveToMongoDB(
  csvText
) {

  const records =
    parse(
      csvText,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }
    );


  console.log(
    `📡 NASA records received: ${records.length}`
  );


  if (
    records.length === 0
  ) {

    console.log(
      "⚠️ No FIRMS records received."
    );

    return;
  }


  /* ---------------------------------------------
     NASA COLUMNS
  --------------------------------------------- */

  console.log(
    "\n🔎 NASA FIRMS COLUMNS:"
  );

  console.log(
    Object.keys(
      records[0]
    )
  );


  /* ---------------------------------------------
     MONGODB
  --------------------------------------------- */

  const {
    client,
    collection,
  } =
    await connectMongo();


  try {

    console.log(
      "✅ MongoDB connected"
    );


    await ensureIndexes(
      collection
    );


    let insideIndia = 0;

    let outsideIndia = 0;

    let invalid = 0;

    let inserted = 0;

    let duplicates = 0;

    let predictions = 0;

    let predictionFailures = 0;


    const invalidReasons = {};


    /* ---------------------------------------------
       PROCESS RECORDS
    --------------------------------------------- */

    for (
      const record of records
    ) {

      const latitude =
        toNumber(
          record.latitude
        );


      const longitude =
        toNumber(
          record.longitude
        );


      /* -------------------------------------------
         COORDINATE VALIDATION
      ------------------------------------------- */

      if (
        latitude === null ||
        longitude === null
      ) {

        invalid++;


        invalidReasons.coordinates =
          (
            invalidReasons.coordinates ||
            0
          ) + 1;


        continue;
      }


      /* -------------------------------------------
         INDIA FILTER
      ------------------------------------------- */

      const pointInsideIndia =
        isPointInsideIndia(
          latitude,
          longitude
        );


      if (
        !pointInsideIndia
      ) {

        outsideIndia++;

        continue;
      }


      insideIndia++;


      /* -------------------------------------------
         PREPROCESS
      ------------------------------------------- */

      const result =
        preprocessRecord(
          record
        );


      if (
        !result.valid
      ) {

        invalid++;


        invalidReasons[
          result.reason
        ] =
          (
            invalidReasons[
              result.reason
            ] || 0
          ) + 1;


        continue;
      }


      const features =
        result.features;


      /* -------------------------------------------
         OBSERVATION KEY
      ------------------------------------------- */

      const observationKey =
        createObservationKey(
          record
        );


      /* -------------------------------------------
         MONGODB DOCUMENT
      ------------------------------------------- */

      const document = {

        observation_key:
          observationKey,


        /* ML FEATURES */

        ...features,


        /* NASA METADATA */

        acq_date:
          String(
            record.acq_date || ""
          ),


        acq_time:
          String(
            record.acq_time || ""
          )
            .trim()
            .padStart(4, "0"),


        satellite:
          record.satellite ||
          null,


        instrument:
          record.instrument ||
          null,


        confidence:
          record.confidence ||
          null,


        version:
          record.version ||
          null,


        /* ORIGINAL VALUES */

        bright_ti4:
          toNumber(
            record.bright_ti4
          ),


        bright_ti5:
          toNumber(
            record.bright_ti5
          ),


        /* SOURCE */

        source_api:
          "NASA_FIRMS",


        source_product:
          SOURCE,


        inside_india:
          true,


        /* PROCESSING */

        preprocessed:
          true,


        prediction_processed:
          false,


        /* PREDICTION */

        prediction:
          null,


        prediction_probability:
          null,


        prediction_label:
          null,


        risk_level:
          null,


        predicted_at:
          null,


        /* COLLECTION */

        collected_at:
          new Date(),
      };


      /* -------------------------------------------
         INSERT
      ------------------------------------------- */

      try {

        const insertResult =
          await collection.insertOne(
            document
          );


        inserted++;


        console.log(
          `🔥 New FIRMS detection saved: ${insertResult.insertedId}`
        );


        /* -----------------------------------------
           ML PREDICTION
        ----------------------------------------- */

        try {

          const savedDetection =
            await collection.findOne({
              _id:
                insertResult.insertedId,
            });


          if (
            savedDetection
          ) {

            console.log(
              `🤖 Running ML prediction: ${insertResult.insertedId}`
            );


            const prediction =
              await predictNewFire(
                savedDetection
              );


            predictions++;


            console.log(
              `✅ Prediction completed: ${prediction.prediction_label}`
            );


          }


        } catch (
          predictionError
        ) {

          predictionFailures++;


          console.error(
            `❌ Prediction failed for ${insertResult.insertedId}:`,
            predictionError.message
          );


          await collection.updateOne(
            {
              _id:
                insertResult.insertedId,
            },
            {
              $set: {
                prediction_processed:
                  false,
              },
            }
          );

        }


      } catch (error) {

        if (
          error.code === 11000
        ) {

          duplicates++;

        } else {

          console.error(
            "❌ MongoDB insert error:",
            error.message
          );

        }
      }
    }


    /* =====================================================
       RESULT
    ===================================================== */

    console.log(
      "\n======================================"
    );

    console.log(
      "📊 THERMAL-X COLLECTION RESULT"
    );

    console.log(
      "======================================"
    );

    console.log(
      `📡 NASA records received : ${records.length}`
    );

    console.log(
      `🇮🇳 Inside India         : ${insideIndia}`
    );

    console.log(
      `🌍 Outside India        : ${outsideIndia}`
    );

    console.log(
      `⚠️ Invalid/skipped      : ${invalid}`
    );

    console.log(
      `🆕 New records inserted : ${inserted}`
    );

    console.log(
      `♻️ Duplicates skipped   : ${duplicates}`
    );

    console.log(
      `🧠 Predictions completed: ${predictions}`
    );

    console.log(
      `❌ Prediction failures  : ${predictionFailures}`
    );


    if (
      Object.keys(
        invalidReasons
      ).length > 0
    ) {

      console.log(
        "\n⚠️ INVALID RECORD REASONS:"
      );

      console.log(
        invalidReasons
      );
    }


    const total =
      await collection.countDocuments();


    console.log(
      `📦 Total MongoDB records: ${total}`
    );


    console.log(
      "======================================"
    );


  } finally {

    await client.close();


    console.log(
      "🔌 MongoDB connection closed"
    );
  }
}


/* =========================================================
   COLLECTION LOCK
========================================================= */

let collectionRunning =
  false;


/* =========================================================
   COLLECTION
========================================================= */

async function collectFirmsData() {

  if (
    collectionRunning
  ) {

    console.log(
      "⚠️ Previous FIRMS collection is still running. Skipping this cycle."
    );

    return;
  }


  collectionRunning = true;


  try {

    const csvText =
      await fetchFirmsData();


    await saveToMongoDB(
      csvText
    );


    console.log(
      "\n✅ FIRMS collection completed successfully"
    );


  } catch (error) {

    console.error(
      "\n❌ FIRMS collection failed:"
    );


    console.error(
      error.message
    );


  } finally {

    collectionRunning =
      false;
  }
}


/* =========================================================
   START
========================================================= */

console.log(
  "\n======================================"
);

console.log(
  "🚀 THERMAL-X FIRMS COLLECTOR"
);

console.log(
  "======================================"
);

console.log(
  "⏱️ Collection interval: 15 minutes"
);

console.log(
  `🛰️ Satellite source: ${SOURCE}`
);

console.log(
  `📍 FIRMS bounding area: ${AREA}`
);

console.log(
  "🇮🇳 India coordinate filter: ENABLED"
);

console.log(
  "🧠 Preprocessing: ENABLED"
);

console.log(
  "🤖 ML prediction: ENABLED"
);

console.log(
  `📊 ML features: ${FEATURES.length}`
);

console.log(
  "======================================"
);


/* =========================================================
   FIRST RUN
========================================================= */

collectFirmsData();


/* =========================================================
   EVERY 15 MINUTES
========================================================= */

setInterval(
  collectFirmsData,
  COLLECTION_INTERVAL
);