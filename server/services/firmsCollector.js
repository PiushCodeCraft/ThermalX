const { MongoClient } = require("mongodb");
const { parse } = require("csv-parse/sync");
const crypto = require("crypto");
require("dotenv").config();

// =====================================================
// CONFIGURATION
// =====================================================

const MONGODB_URI = process.env.MONGODB_URI;
const NASA_MAP_KEY = process.env.NASA_FIRMS_MAP_KEY;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in server/.env");
}

if (!NASA_MAP_KEY) {
  throw new Error(
    "❌ NASA_FIRMS_MAP_KEY is missing in server/.env"
  );
}


// =====================================================
// FIRMS CONFIGURATION
// =====================================================

// India bounding box:
// west, south, east, north
const AREA = "68,8,97,35";

// NASA VIIRS NOAA-21 Near Real-Time
const SOURCE = "VIIRS_NOAA21_NRT";

// Most recent available day
const DAY_RANGE = "1";


// =====================================================
// MONGODB CONFIGURATION
// =====================================================

const DATABASE_NAME = "ThermalX";
const COLLECTION_NAME = "firms_raw";


// =====================================================
// COLLECTION INTERVAL
// =====================================================

// FIRMS services are updated approximately every 15 minutes.
const COLLECTION_INTERVAL = 15 * 60 * 1000;


// =====================================================
// CREATE UNIQUE OBSERVATION KEY
// =====================================================

function createObservationKey(record) {

  const rawKey = [
    record.satellite,
    record.instrument,
    record.acq_date,
    record.acq_time,
    record.latitude,
    record.longitude,
    record.version
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(rawKey)
    .digest("hex");
}


// =====================================================
// FETCH NASA FIRMS DATA
// =====================================================

async function fetchFirmsData() {

  const url =
    `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` +
    `${NASA_MAP_KEY}/` +
    `${SOURCE}/` +
    `${AREA}/` +
    `${DAY_RANGE}`;

  console.log("\n======================================");
  console.log("🔥 NASA FIRMS COLLECTION");
  console.log("======================================");

  console.log(`Source: ${SOURCE}`);
  console.log(`Area: ${AREA}`);
  console.log(`Day range: ${DAY_RANGE}`);
  console.log("Fetching NASA FIRMS data...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `NASA FIRMS request failed: ${response.status} ${response.statusText}`
    );
  }

  const csvText = await response.text();

  if (!csvText || csvText.trim().length === 0) {
    throw new Error("NASA FIRMS returned empty data");
  }

  return csvText;
}


// =====================================================
// CONNECT TO MONGODB
// =====================================================

async function connectMongo() {

  const client = new MongoClient(MONGODB_URI);

  await client.connect();

  const db = client.db(DATABASE_NAME);
  const collection = db.collection(COLLECTION_NAME);

  return {
    client,
    collection
  };
}


// =====================================================
// CREATE MONGODB INDEX
// =====================================================

async function ensureIndexes(collection) {

  await collection.createIndex(
    { observation_key: 1 },
    {
      unique: true,
      name: "unique_observation_key"
    }
  );

  await collection.createIndex(
    { processed: 1 },
    {
      name: "processed_index"
    }
  );

  await collection.createIndex(
    { collected_at: -1 },
    {
      name: "collected_at_index"
    }
  );

  console.log("✅ MongoDB indexes verified");
}


// =====================================================
// STORE RAW DATA
// =====================================================

async function saveToMongoDB(csvText) {

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(
    `📡 NASA records received: ${records.length}`
  );

  if (records.length === 0) {

    console.log(
      "⚠️ No FIRMS records received."
    );

    return;
  }


  const {
    client,
    collection
  } = await connectMongo();

  try {

    console.log("✅ MongoDB connected");

    // Make sure indexes exist
    await ensureIndexes(collection);


    // =================================================
    // PREPARE DOCUMENTS
    // =================================================

    const documents = records.map((record) => {

      const observationKey =
        createObservationKey(record);

      return {

        // ---------------------------------------------
        // RAW NASA FIRMS DATA
        // ---------------------------------------------

        ...record,

        // ---------------------------------------------
        // THERMAL-X METADATA
        // ---------------------------------------------

        observation_key: observationKey,

        source_api: "NASA_FIRMS",

        source_product: SOURCE,

        // ---------------------------------------------
        // PROCESSING STATUS
        // ---------------------------------------------

        processed: false,

        // ---------------------------------------------
        // INGESTION TIME
        // ---------------------------------------------

        collected_at: new Date()
      };
    });


    // =================================================
    // INSERT ONLY NEW RECORDS
    // =================================================

    let inserted = 0;
    let duplicates = 0;


    for (const document of documents) {

      try {

        await collection.insertOne(document);

        inserted++;

      } catch (error) {

        // MongoDB duplicate key error
        if (error.code === 11000) {

          duplicates++;

        } else {

          throw error;
        }
      }
    }


    // =================================================
    // RESULTS
    // =================================================

    console.log("\n--------------------------------------");

    console.log(
      `🆕 New records inserted: ${inserted}`
    );

    console.log(
      `♻️ Duplicate records skipped: ${duplicates}`
    );

    console.log(
      `📊 Total received: ${records.length}`
    );

    console.log("--------------------------------------");


    // =================================================
    // CURRENT DATABASE COUNT
    // =================================================

    const total =
      await collection.countDocuments();

    console.log(
      `📦 Total documents in firms_raw: ${total}`
    );

  } finally {

    await client.close();

    console.log(
      "🔌 MongoDB connection closed"
    );
  }
}


// =====================================================
// COMPLETE COLLECTION
// =====================================================

let collectionRunning = false;

async function collectFirmsData() {

  // Prevent overlapping executions
  if (collectionRunning) {

    console.log(
      "⚠️ Previous FIRMS collection is still running. Skipping this cycle."
    );

    return;
  }

  collectionRunning = true;

  try {

    const csvText =
      await fetchFirmsData();

    await saveToMongoDB(csvText);

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

    collectionRunning = false;
  }
}


// =====================================================
// START COLLECTOR
// =====================================================

console.log("\n======================================");
console.log("🚀 THERMAL-X FIRMS COLLECTOR");
console.log("======================================");

console.log(
  `⏱️ Collection interval: 15 minutes`
);

console.log(
  `🛰️ Satellite source: ${SOURCE}`
);

console.log(
  `📍 Area: ${AREA}`
);


// =====================================================
// RUN IMMEDIATELY
// =====================================================

collectFirmsData();


// =====================================================
// RUN EVERY 15 MINUTES
// =====================================================

setInterval(
  collectFirmsData,
  COLLECTION_INTERVAL
);