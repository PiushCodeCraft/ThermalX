const express = require("express");
const router = express.Router();

const { pool } = require("../postgres");
const { MongoClient } = require("mongodb");


// =====================================================
// MONGODB CONFIGURATION
// =====================================================

const MONGODB_URI = process.env.MONGODB_URI;

const MONGO_DATABASE = "ThermalX";
const MONGO_COLLECTION = "firms_raw";


// =====================================================
// FIRE COUNT
// GET /api/fire/count
// =====================================================

router.get("/count", async (req, res) => {
  let client = null;

  try {

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    client = new MongoClient(MONGODB_URI);

    await client.connect();

    const db =
      client.db(MONGO_DATABASE);

    const collection =
      db.collection(MONGO_COLLECTION);

    const count =
      await collection.countDocuments();

    res.json({
      success: true,
      count,
      database: MONGO_DATABASE,
      collection: MONGO_COLLECTION,
    });

  } catch (error) {

    console.error(
      "❌ Fire count error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch fire count",
      error: error.message,
    });

  } finally {

    if (client) {
      await client.close();
    }
  }
});


// =====================================================
// FIRE DETECTIONS
// GET /api/fire/detections
//
// SOURCE:
// MongoDB → ThermalX → firms_raw
// =====================================================

router.get("/detections", async (req, res) => {

  let client = null;

  try {

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }


    // =================================================
    // LIMIT
    // =================================================

    const requestedLimit =
      Number(req.query.limit) || 200;

    const limit =
      Math.min(
        Math.max(
          requestedLimit,
          1
        ),
        1000
      );


    // =================================================
    // CONNECT MONGODB
    // =================================================

    client =
      new MongoClient(
        MONGODB_URI
      );

    await client.connect();

    console.log(
      "✅ Fire detections MongoDB connected"
    );


    const db =
      client.db(
        MONGO_DATABASE
      );

    const collection =
      db.collection(
        MONGO_COLLECTION
      );


    // =================================================
    // FETCH FIRMS DATA
    // =================================================

    const docs =
      await collection
        .find({})
        .sort({
          collected_at: -1,
          predicted_at: -1,
          acq_date: -1,
          acq_time: -1,
        })
        .limit(limit)
        .toArray();


    // =================================================
    // NORMALIZE MONGODB DATA
    // =================================================

    const incidents =
      docs.map((doc) => {

        const latitude =
          Number(doc.latitude);

        const longitude =
          Number(doc.longitude);


        // ---------------------------------------------
        // PREDICTION
        // ---------------------------------------------

        const prediction =
          doc.prediction !== undefined
            ? Number(doc.prediction)
            : null;


        const predictionProbability =
          doc.prediction_probability !== undefined
            ? Number(
                doc.prediction_probability
              )
            : null;


        const predictionLabel =
          doc.prediction_label ||
          (
            prediction === 1
              ? "Future Fire"
              : prediction === 0
              ? "No Future Fire"
              : "Prediction Pending"
          );


        // ---------------------------------------------
        // RISK
        // ---------------------------------------------

        const riskLevel =
          doc.risk_level ||
          "LOW";


        // ---------------------------------------------
        // STATUS
        // ---------------------------------------------

        let status =
          doc.status ||
          null;


        if (!status) {

          if (
            riskLevel === "HIGH" ||
            riskLevel === "CRITICAL"
          ) {
            status = "Active";
          } else if (
            doc.prediction_processed === true
          ) {
            status = "Monitoring";
          } else {
            status = "Processing";
          }
        }


        // ---------------------------------------------
        // CONFIDENCE
        //
        // FIRMS confidence is usually:
        // l / n / h
        //
        // Keep original value.
        // ---------------------------------------------

        const confidence =
          doc.confidence ??
          null;


        // ---------------------------------------------
        // TIME
        // ---------------------------------------------

        const acqTime =
          doc.acq_time ||
          null;


        // ---------------------------------------------
        // DATE
        // ---------------------------------------------

        const acqDate =
          doc.acq_date ||
          null;


        // ---------------------------------------------
        // TEMPERATURE
        //
        // VIIRS brightness temperature.
        // ---------------------------------------------

        const temperature =
          doc.bright_ti4 !== undefined
            ? Number(doc.bright_ti4)
            : doc.brightness !== undefined
            ? Number(doc.brightness)
            : null;


        // ---------------------------------------------
        // SOURCE
        // ---------------------------------------------

        const satellite =
          doc.satellite ||
          "VIIRS NOAA-21";


        // ---------------------------------------------
        // LOCATION
        //
        // Exact location data available is lat/lon.
        // ---------------------------------------------

        const location =
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
            ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
            : "Unknown";


        // ---------------------------------------------
        // RETURN NORMALIZED INCIDENT
        // ---------------------------------------------

        return {

          id:
            String(doc._id),

          incidentId:
            String(doc._id),

          location,

          state:
            doc.state ||
            "India",

          severity:
            riskLevel,

          risk_level:
            riskLevel,

          prediction,

          prediction_label:
            predictionLabel,

          prediction_probability:
            predictionProbability,

          confidence,

          time:
            acqTime,

          acq_time:
            acqTime,

          date:
            acqDate,

          acq_date:
            acqDate,

          source:
            satellite,

          satellite,

          temperature,

          temperatureK:
            temperature,

          status,

          latitude,

          longitude,

          frp:
            doc.frp !== undefined
              ? Number(doc.frp)
              : null,

          brightness:
            doc.brightness !== undefined
              ? Number(doc.brightness)
              : null,

          bright_t31:
            doc.bright_t31 !== undefined
              ? Number(doc.bright_t31)
              : null,

          prediction_processed:
            doc.prediction_processed === true,

          predicted_at:
            doc.predicted_at ||
            null,

          collected_at:
            doc.collected_at ||
            null,

          source_api:
            doc.source_api ||
            "NASA_FIRMS",

          raw:
            doc,
        };
      });


    // =================================================
    // RESPONSE
    // =================================================

    console.log(
      `🔥 MongoDB incidents returned: ${incidents.length}`
    );


    res.json({

      success: true,

      count:
        incidents.length,

      data:
        incidents,

    });


  } catch (error) {

    console.error(
      "❌ Fire detections error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch fire detections",

      error:
        error.message,

    });

  } finally {

    if (client) {

      await client.close();

      console.log(
        "🔌 Fire detections MongoDB connection closed"
      );
    }
  }
});


// =====================================================
// LIVE THERMAL POINTS
// GET /api/fire/live-points
// =====================================================

router.get("/live-points", async (req, res) => {

  let client = null;

  try {

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    const requestedLimit =
      Number(req.query.limit) || 200;

    const limit =
      Math.min(
        Math.max(
          requestedLimit,
          1
        ),
        1000
      );


    client =
      new MongoClient(
        MONGODB_URI
      );

    await client.connect();

    const db =
      client.db(
        MONGO_DATABASE
      );

    const collection =
      db.collection(
        MONGO_COLLECTION
      );


    const docs =
      await collection
        .find({})
        .sort({
          collected_at: -1,
          acq_date: -1,
          acq_time: -1,
        })
        .limit(limit)
        .toArray();


    const points =
      docs.map((doc) => ({

        id:
          String(doc._id),

        latitude:
          Number(doc.latitude),

        longitude:
          Number(doc.longitude),

        frp:
          Number(doc.frp) || 0,

        brightness:
          Number(doc.brightness) ||
          Number(doc.bright_ti4) ||
          0,

        bright_t31:
          Number(doc.bright_t31) ||
          Number(doc.bright_ti5) ||
          0,

        acq_date:
          doc.acq_date || "",

        acq_time:
          doc.acq_time || "",

        satellite:
          doc.satellite ||
          "VIIRS NOAA-21",

        daynight:
          doc.daynight === 1
            ? "Day"
            : doc.daynight === 0
            ? "Night"
            : String(
                doc.daynight ||
                "N/A"
              ),

        confidence:
          doc.confidence ||
          "nominal",

        prediction:
          doc.prediction ??
          null,

        prediction_label:
          doc.prediction_label ||
          null,

        prediction_probability:
          doc.prediction_probability ??
          null,

        risk_level:
          doc.risk_level ||
          "LOW",

        source:
          "MongoDB firms_raw",

      }));


    res.json({

      success: true,

      count:
        points.length,

      data:
        points,

    });


  } catch (error) {

    console.error(
      "❌ Fire live-points error:",
      error.message
    );

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch live thermal points",

      error:
        error.message,

    });

  } finally {

    if (client) {
      await client.close();
    }
  }
});


// =====================================================
// 5KM SURROUNDING DATA
// =====================================================

const surroundingsCache =
  new Map();

const CACHE_TTL_MS =
  15 * 60 * 1000;


function haversineDistanceMeters(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;

  const dLat =
    ((lat2 - lat1) *
      Math.PI) /
    180;

  const dLon =
    ((lon2 - lon1) *
      Math.PI) /
    180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}


function classifyOsmElement(tags) {

  if (!tags) return null;

  const amenity =
    tags.amenity || "";

  const landuse =
    tags.landuse || "";

  const manMade =
    tags.man_made || "";

  const industrial =
    tags.industrial || "";

  const power =
    tags.power || "";

  const natural =
    tags.natural || "";

  const leisure =
    tags.leisure || "";

  const place =
    tags.place || "";


  if (
    landuse === "industrial" ||
    industrial ||
    [
      "works",
      "factory",
      "pipeline",
      "storage_tank",
      "gasometer",
      "chimney",
      "wastewater_plant",
    ].includes(manMade) ||
    [
      "plant",
      "substation",
      "generator",
    ].includes(power)
  ) {

    return {

      category:
        "industrial",

      categoryLabel:
        "Industrial Facility",

      icon:
        "factory",

      badgeColor:
        "#ea580c",

      type:
        industrial ||
        (
          power
            ? `Power ${power}`
            : null
        ) ||
        (
          manMade
            ? `Man-made: ${manMade}`
            : null
        ) ||
        "Industrial Zone",

    };
  }


  if (
    [
      "school",
      "college",
      "university",
      "kindergarten",
    ].includes(amenity)
  ) {

    return {

      category:
        "education",

      categoryLabel:
        "Educational Institution",

      icon:
        "graduation-cap",

      badgeColor:
        "#3b82f6",

      type:
        amenity
          .charAt(0)
          .toUpperCase() +
        amenity.slice(1),

    };
  }


  if (
    [
      "hospital",
      "clinic",
      "doctors",
      "pharmacy",
    ].includes(amenity)
  ) {

    return {

      category:
        "healthcare",

      categoryLabel:
        "Healthcare & Medical",

      icon:
        "heart-pulse",

      badgeColor:
        "#ec4899",

      type:
        amenity
          .charAt(0)
          .toUpperCase() +
        amenity.slice(1),

    };
  }


  if (
    [
      "fire_station",
      "police",
    ].includes(amenity)
  ) {

    return {

      category:
        "emergency",

      categoryLabel:
        "Emergency Services",

      icon:
        "shield-alert",

      badgeColor:
        "#dc2626",

      type:
        amenity ===
        "fire_station"
          ? "Fire Station"
          : "Police Station",

    };
  }


  if (
    landuse === "residential" ||
    [
      "town",
      "village",
      "suburb",
      "hamlet",
      "neighbourhood",
    ].includes(place)
  ) {

    return {

      category:
        "residential",

      categoryLabel:
        "Residential & Settlement",

      icon:
        "home",

      badgeColor:
        "#8b5cf6",

      type:
        place
          ? `Settlement: ${place}`
          : "Residential Area",

    };
  }


  if (
    [
      "wood",
      "scrub",
      "water",
      "wetland",
    ].includes(natural) ||
    [
      "nature_reserve",
      "park",
    ].includes(leisure) ||
    landuse === "forest"
  ) {

    return {

      category:
        "environment",

      categoryLabel:
        "Environmental / Forest",

      icon:
        "trees",

      badgeColor:
        "#10b981",

      type:
        natural ||
        leisure ||
        landuse,

    };
  }


  if (
    landuse === "commercial"
  ) {

    return {

      category:
        "commercial",

      categoryLabel:
        "Commercial Zone",

      icon:
        "building",

      badgeColor:
        "#6366f1",

      type:
        "Commercial Area",

    };
  }


  return null;
}


// =====================================================
// SURROUNDINGS
// GET /api/fire/surroundings
// =====================================================

router.get(
  "/surroundings",
  async (req, res) => {

    try {

      const lat =
        parseFloat(
          req.query.lat
        );

      const lon =
        parseFloat(
          req.query.lon
        );

      const radiusMeters =
        Math.min(
          Math.max(
            parseFloat(
              req.query.radius
            ) || 5000,
            500
          ),
          15000
        );

      const radiusKm =
        radiusMeters / 1000;


      if (
        Number.isNaN(lat) ||
        Number.isNaN(lon)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid latitude and longitude are required query parameters.",

        });
      }


      const cacheKey =
        `${lat.toFixed(3)},${lon.toFixed(3)},${radiusMeters}`;


      const cached =
        surroundingsCache.get(
          cacheKey
        );


      if (
        cached &&
        Date.now() -
          cached.timestamp <
          CACHE_TTL_MS
      ) {

        return res.json({

          success: true,

          cached: true,

          ...cached.data,

        });
      }


      const dLat =
        radiusKm / 111.0;

      const dLon =
        radiusKm /
        (
          111.0 *
          Math.cos(
            (lat * Math.PI) /
              180
          )
        );


      const south =
        lat - dLat;

      const north =
        lat + dLat;

      const west =
        lon - dLon;

      const east =
        lon + dLon;


      const bbox =
        `${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}`;


      const overpassQuery =
        `[out:json][timeout:20];
(
  nwr["amenity"~"school|college|university|hospital|clinic|fire_station|police"](${bbox});
  nwr["landuse"~"industrial|residential|forest"](${bbox});
  nwr["industrial"](${bbox});
  nwr["man_made"~"works|factory|pipeline|storage_tank"](${bbox});
  nwr["power"~"plant|substation"](${bbox});
  nwr["natural"~"wood"](${bbox});
);
out tags center 50;`;


      let osmElements = [];


      const overpassEndpoints = [

        "https://overpass-api.de/api/interpreter",

        "https://overpass.kumi.systems/api/interpreter",

      ];


      for (
        const ep of
          overpassEndpoints
      ) {

        try {

          const controller =
            new AbortController();

          const timeout =
            setTimeout(
              () =>
                controller.abort(),
              8000
            );


          const response =
            await fetch(
              ep,
              {

                method:
                  "POST",

                headers: {

                  "Content-Type":
                    "application/x-www-form-urlencoded",

                  "User-Agent":
                    "ThermalX-Surveillance/1.0",

                },

                body:
                  "data=" +
                  encodeURIComponent(
                    overpassQuery
                  ),

                signal:
                  controller.signal,

              }
            );


          clearTimeout(
            timeout
          );


          if (
            response.ok
          ) {

            const json =
              await response.json();

            osmElements =
              json.elements ||
              [];

            break;
          }

        } catch (err) {

          console.warn(
            `⚠️ Overpass endpoint ${ep} failed:`,
            err.message
          );
        }
      }


      let locationName =
        `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;


      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(
            () =>
              controller.abort(),
            3000
          );


        const nomRes =
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=12`,
            {

              headers: {

                "User-Agent":
                  "ThermalX-Surveillance/1.0",

              },

              signal:
                controller.signal,

            }
          );


        clearTimeout(
          timeout
        );


        if (
          nomRes.ok
        ) {

          const nomData =
            await nomRes.json();

          if (
            nomData.display_name
          ) {

            locationName =
              nomData.display_name;
          }
        }

      } catch (_) {
        // Non-blocking fallback
      }


      const seenNames =
        new Set();

      const surroundings =
        [];


      for (
        const el of
          osmElements
      ) {

        const tags =
          el.tags || {};

        const classification =
          classifyOsmElement(
            tags
          );


        if (
          !classification
        ) continue;


        const itemLat =
          el.lat ||
          (
            el.center &&
            el.center.lat
          );

        const itemLon =
          el.lon ||
          (
            el.center &&
            el.center.lon
          );


        if (
          itemLat === undefined ||
          itemLon === undefined
        ) continue;


        const distanceMeters =
          haversineDistanceMeters(
            lat,
            lon,
            itemLat,
            itemLon
          );


        if (
          distanceMeters >
          radiusMeters
        ) continue;


        const name =
          tags.name ||
          tags["name:en"] ||
          tags.operator ||
          tags.description ||
          `${classification.categoryLabel} (${classification.type})`;


        const dedupKey =
          `${name}_${classification.category}`;


        if (
          seenNames.has(
            dedupKey
          )
        ) continue;


        seenNames.add(
          dedupKey
        );


        surroundings.push({

          id:
            `${el.type}/${el.id}`,

          name,

          category:
            classification.category,

          categoryLabel:
            classification.categoryLabel,

          type:
            classification.type,

          icon:
            classification.icon,

          badgeColor:
            classification.badgeColor,

          latitude:
            itemLat,

          longitude:
            itemLon,

          distanceMeters:
            Math.round(
              distanceMeters
            ),

          distanceKm:
            parseFloat(
              (
                distanceMeters /
                1000
              ).toFixed(2)
            ),

        });
      }


      surroundings.sort(
        (a, b) =>
          a.distanceMeters -
          b.distanceMeters
      );


      const counts = {

        total:
          surroundings.length,

        industrial:
          surroundings.filter(
            (s) =>
              s.category ===
              "industrial"
          ).length,

        education:
          surroundings.filter(
            (s) =>
              s.category ===
              "education"
          ).length,

        healthcare:
          surroundings.filter(
            (s) =>
              s.category ===
              "healthcare"
          ).length,

        emergency:
          surroundings.filter(
            (s) =>
              s.category ===
              "emergency"
          ).length,

        residential:
          surroundings.filter(
            (s) =>
              s.category ===
              "residential"
          ).length,

        environment:
          surroundings.filter(
            (s) =>
              s.category ===
              "environment"
          ).length,

      };


      let riskLevel =
        "LOW";

      let riskScore =
        20;

      const riskReasons =
        [];


      const closeIndustrial =
        surroundings.filter(
          (s) =>
            s.category ===
              "industrial" &&
            s.distanceKm <=
              2.5
        );


      const closeSchools =
        surroundings.filter(
          (s) =>
            s.category ===
              "education" &&
            s.distanceKm <=
              2
        );


      const closeHospitals =
        surroundings.filter(
          (s) =>
            s.category ===
              "healthcare" &&
            s.distanceKm <=
              2
        );


      if (
        closeIndustrial.length >
        0
      ) {

        riskScore += 45;

        riskReasons.push(
          `${closeIndustrial.length} industrial facility within 2.5km`
        );
      }


      if (
        closeSchools.length >
        0
      ) {

        riskScore += 30;

        riskReasons.push(
          `${closeSchools.length} school(s) within 2.0km`
        );
      }


      if (
        closeHospitals.length >
        0
      ) {

        riskScore += 25;

        riskReasons.push(
          `${closeHospitals.length} hospital(s) within 2.0km`
        );
      }


      if (
        riskScore >= 75
      ) {

        riskLevel =
          "CRITICAL";

      } else if (
        riskScore >= 50
      ) {

        riskLevel =
          "HIGH";

      } else if (
        riskScore >= 30
      ) {

        riskLevel =
          "MODERATE";

      } else {

        riskLevel =
          "LOW";
      }


      const responseData = {

        center: {

          latitude:
            lat,

          longitude:
            lon,

          radiusMeters,

          radiusKm,

          locationName,

        },

        counts,

        riskAssessment: {

          level:
            riskLevel,

          score:
            Math.min(
              riskScore,
              100
            ),

          reasons:
            riskReasons,

          summary:
            riskReasons.length >
            0
              ? riskReasons.join(
                  " • "
                )
              : "No high-risk industrial or educational infrastructure in immediate 2km proximity.",

        },

        surroundings,

      };


      surroundingsCache.set(
        cacheKey,
        {

          timestamp:
            Date.now(),

          data:
            responseData,

        }
      );


      res.json({

        success: true,

        cached: false,

        ...responseData,

      });

    } catch (error) {

      console.error(
        "❌ Fire surroundings error:",
        error.message
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to query 5km surroundings",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;


// =====================================================
// LIVE MAP SUMMARY
// GET /api/fire/live-summary
// =====================================================

router.get("/live-summary", async (req, res) => {
  let client = null;

  try {
    if (!MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: "MONGODB_URI is missing.",
      });
    }

    // -----------------------------------------------
    // CONNECT TO MONGODB
    // -----------------------------------------------

    client = new MongoClient(MONGODB_URI);

    await client.connect();

    const db = client.db(MONGO_DATABASE);
    const collection = db.collection(MONGO_COLLECTION);

    // -----------------------------------------------
    // TOTAL THERMAL DETECTIONS
    // -----------------------------------------------

    const thermalDetections =
      await collection.countDocuments();

    // -----------------------------------------------
    // ACTIVE INCIDENTS
    //
    // HIGH + CRITICAL
    // -----------------------------------------------

    const activeIncidents =
      await collection.countDocuments({
        prediction_processed: true,
        risk_level: {
          $in: ["HIGH", "CRITICAL"],
        },
      });

    // -----------------------------------------------
    // PREDICTIONS COMPLETED
    // -----------------------------------------------

    const aiAnalyses =
      await collection.countDocuments({
        prediction_processed: true,
      });

    // -----------------------------------------------
    // LAST 24 HOURS
    // -----------------------------------------------

    const last24Hours =
      new Date(
        Date.now() -
        24 * 60 * 60 * 1000
      );

    const detectionsLast24Hours =
      await collection.countDocuments({
        collected_at: {
          $gte: last24Hours,
        },
      });

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    const data = {
      thermalDetections,
      activeIncidents,
      aiAnalyses,
      detectionsLast24Hours,
      satelliteSource: "VIIRS NOAA-21",
      monitoredRegion: "INDIA",
      database: "MongoDB",
      collection: MONGO_COLLECTION,
    };

    console.log(
      "\n======================================"
    );

    console.log(
      "🗺️ ADMIN LIVE MAP SUMMARY"
    );

    console.log(
      "======================================"
    );

    console.log(
      `🔥 Thermal detections : ${thermalDetections}`
    );

    console.log(
      `🚨 Active incidents   : ${activeIncidents}`
    );

    console.log(
      `🧠 AI analyses        : ${aiAnalyses}`
    );

    console.log(
      `📡 Last 24 hours      : ${detectionsLast24Hours}`
    );

    console.log(
      "======================================"
    );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(
      "❌ Live Map summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve Live Map summary.",
      error:
        error.message,
    });

  } finally {

    if (client) {
      await client.close();

      console.log(
        "🔌 Live Map MongoDB connection closed"
      );
    }
  }
});