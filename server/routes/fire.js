const express = require("express");
const router = express.Router();

const { pool } = require("../postgres");



// your existing /count route below this
// ==========================================
// FIRE COUNT
// GET /api/fire/count
// ==========================================
router.get("/count", async (req, res) => {
  try {
    const dbInfo = await pool.query(`
      SELECT
        current_user,
        current_database(),
        current_schema(),
        inet_server_addr()
    `);

    const tableInfo = await pool.query(`
      SELECT
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'fire_detections'
    `);

    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM public.fire_detections
    `);

    res.json({
      success: true,
      database: dbInfo.rows[0],
      table: tableInfo.rows[0],
      count: Number(result.rows[0].count),
    });

  } catch (error) {
    console.error("❌ Fire count error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fire count",
      error: error.message,
    });
  }
});

// ==========================================
// FIRE DETECTIONS
// GET /api/fire/detections
// ==========================================
router.get("/detections", async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit) || 100;

    const limit = Math.min(Math.max(requestedLimit, 1), 1000);

    const result = await pool.query(
      `
      SELECT
        id,
        latitude,
        longitude,
        brightness,
        bright_t31,
        frp,
        scan,
        track,
        daynight,
        hour,
        day,
        month,
        day_of_year,
        day_of_week,
        brightness_difference,
        frp_log
      FROM public.fire_detections
      ORDER BY id
      LIMIT $1
      `,
      [limit]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Fire detections error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fire detections",
      error: error.message,
    });
  }
});

// ==========================================
// LIVE THERMAL POINTS (FROM MONGODB firms_raw)
// GET /api/fire/live-points
// ==========================================
router.get("/live-points", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const requestedLimit = Number(req.query.limit) || 200;
    const limit = Math.min(Math.max(requestedLimit, 1), 1000);

    let points = [];

    // Attempt to load from MongoDB ThermalX.firms_raw
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const db = mongoose.connection.client.db("ThermalX");
        const docs = await db
          .collection("firms_raw")
          .find({})
          .sort({ collected_at: -1, acq_date: -1, acq_time: -1 })
          .limit(limit)
          .toArray();

        points = docs.map((doc) => ({
          id: String(doc._id),
          latitude: Number(doc.latitude),
          longitude: Number(doc.longitude),
          frp: Number(doc.frp) || 0,
          brightness: Number(doc.brightness) || Number(doc.bright_ti4) || 0,
          bright_t31: Number(doc.bright_t31) || Number(doc.bright_ti5) || 0,
          acq_date: doc.acq_date || "",
          acq_time: doc.acq_time || "",
          satellite: doc.satellite || "VIIRS NOAA-21",
          daynight: doc.daynight === 1 ? "Day" : doc.daynight === 0 ? "Night" : "N/A",
          confidence: doc.confidence || "nominal",
          source: "MongoDB firms_raw",
        }));
      } catch (mongoErr) {
        console.warn("⚠️ Could not read from firms_raw in MongoDB:", mongoErr.message);
      }
    }

    // If MongoDB returned no points, fallback to PostgreSQL public.fire_detections
    if (!points.length) {
      try {
        const pgResult = await pool.query(
          `
          SELECT
            id,
            latitude,
            longitude,
            brightness,
            bright_t31,
            frp,
            daynight,
            hour,
            day,
            month
          FROM public.fire_detections
          ORDER BY id DESC
          LIMIT $1
          `,
          [limit]
        );

        points = pgResult.rows.map((row) => ({
          id: String(row.id),
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          frp: Number(row.frp) || 0,
          brightness: Number(row.brightness) || 0,
          bright_t31: Number(row.bright_t31) || 0,
          acq_date: `${row.day}/${row.month}`,
          acq_time: `${String(row.hour || 0).padStart(2, "0")}00`,
          satellite: "Historical / PostgreSQL",
          daynight: row.daynight === 1 ? "Day" : "Night",
          confidence: "verified",
          source: "PostgreSQL",
        }));
      } catch (pgErr) {
        console.warn("⚠️ Postgres fallback error:", pgErr.message);
      }
    }

    res.json({
      success: true,
      count: points.length,
      data: points,
    });
  } catch (error) {
    console.error("❌ Fire live-points error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch live thermal points",
      error: error.message,
    });
  }
});

// ==========================================
// 5KM SURROUNDING DATA & VULNERABILITY ANALYSIS
// GET /api/fire/surroundings?lat=...&lon=...&radius=5000
// ==========================================

// In-memory cache for fast repeated queries (15 min TTL)
const surroundingsCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function classifyOsmElement(tags) {
  if (!tags) return null;

  const amenity = tags.amenity || "";
  const landuse = tags.landuse || "";
  const manMade = tags.man_made || "";
  const industrial = tags.industrial || "";
  const power = tags.power || "";
  const natural = tags.natural || "";
  const leisure = tags.leisure || "";
  const place = tags.place || "";

  // 1. Industrial / Energy / Factories
  if (
    landuse === "industrial" ||
    industrial ||
    ["works", "factory", "pipeline", "storage_tank", "gasometer", "chimney", "wastewater_plant"].includes(manMade) ||
    ["plant", "substation", "generator"].includes(power)
  ) {
    return {
      category: "industrial",
      categoryLabel: "Industrial Facility",
      icon: "factory",
      badgeColor: "#ea580c",
      type:
        industrial ||
        (power ? `Power ${power}` : null) ||
        (manMade ? `Man-made: ${manMade}` : null) ||
        "Industrial Zone",
    };
  }

  // 2. Education (Schools, Colleges, Universities)
  if (["school", "college", "university", "kindergarten"].includes(amenity)) {
    return {
      category: "education",
      categoryLabel: "Educational Institution",
      icon: "graduation-cap",
      badgeColor: "#3b82f6",
      type: amenity.charAt(0).toUpperCase() + amenity.slice(1),
    };
  }

  // 3. Healthcare
  if (["hospital", "clinic", "doctors", "pharmacy"].includes(amenity)) {
    return {
      category: "healthcare",
      categoryLabel: "Healthcare & Medical",
      icon: "heart-pulse",
      badgeColor: "#ec4899",
      type: amenity.charAt(0).toUpperCase() + amenity.slice(1),
    };
  }

  // 4. Emergency Services
  if (["fire_station", "police"].includes(amenity)) {
    return {
      category: "emergency",
      categoryLabel: "Emergency Services",
      icon: "shield-alert",
      badgeColor: "#dc2626",
      type: amenity === "fire_station" ? "Fire Station" : "Police Station",
    };
  }

  // 5. Residential / Settlements
  if (
    landuse === "residential" ||
    ["town", "village", "suburb", "hamlet", "neighbourhood"].includes(place)
  ) {
    return {
      category: "residential",
      categoryLabel: "Residential & Settlement",
      icon: "home",
      badgeColor: "#8b5cf6",
      type: place ? `Settlement: ${place}` : "Residential Area",
    };
  }

  // 6. Environmental / Protected areas
  if (
    ["wood", "scrub", "water", "wetland"].includes(natural) ||
    ["nature_reserve", "park"].includes(leisure) ||
    landuse === "forest"
  ) {
    return {
      category: "environment",
      categoryLabel: "Environmental / Forest",
      icon: "trees",
      badgeColor: "#10b981",
      type: natural || leisure || landuse,
    };
  }

  // 7. Commercial
  if (landuse === "commercial") {
    return {
      category: "commercial",
      categoryLabel: "Commercial Zone",
      icon: "building",
      badgeColor: "#6366f1",
      type: "Commercial Area",
    };
  }

  return null;
}

router.get("/surroundings", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const radiusMeters = Math.min(Math.max(parseFloat(req.query.radius) || 5000, 500), 15000);
    const radiusKm = radiusMeters / 1000;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required query parameters.",
      });
    }

    // Check cache
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${radiusMeters}`;
    const cached = surroundingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        cached: true,
        ...cached.data,
      });
    }

    // Spatial Bounding Box for fast Overpass query
    const dLat = radiusKm / 111.0;
    const dLon = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180.0));
    const south = lat - dLat;
    const north = lat + dLat;
    const west = lon - dLon;
    const east = lon + dLon;
    const bbox = `${south.toFixed(5)},${west.toFixed(5)},${north.toFixed(5)},${east.toFixed(5)}`;

    const overpassQuery = `[out:json][timeout:20];
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

    for (const ep of overpassEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(ep, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "ThermalX-Surveillance/1.0 (https://thermalx.internal)",
          },
          body: "data=" + encodeURIComponent(overpassQuery),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const json = await response.json();
          osmElements = json.elements || [];
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Overpass endpoint ${ep} failed:`, err.message);
      }
    }

    // Optional location address via Nominatim (reverse geocoding)
    let locationName = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
    try {
      const nomController = new AbortController();
      const nomTimeout = setTimeout(() => nomController.abort(), 3000);
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=12`,
        {
          headers: {
            "User-Agent": "ThermalX-Surveillance/1.0",
          },
          signal: nomController.signal,
        }
      );
      clearTimeout(nomTimeout);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (nomData.display_name) {
          locationName = nomData.display_name;
        }
      }
    } catch (_) {
      // Non-blocking fallback
    }

    // Process & calculate exact distances for all found POIs
    const seenNames = new Set();
    const surroundings = [];

    for (const el of osmElements) {
      const tags = el.tags || {};
      const classification = classifyOsmElement(tags);
      if (!classification) continue;

      const itemLat = el.lat || (el.center && el.center.lat);
      const itemLon = el.lon || (el.center && el.center.lon);

      if (itemLat === undefined || itemLon === undefined) continue;

      const distanceMeters = haversineDistanceMeters(lat, lon, itemLat, itemLon);
      // Strictly filter to within the requested radius
      if (distanceMeters > radiusMeters) continue;

      const name =
        tags.name ||
        tags["name:en"] ||
        tags.operator ||
        tags.description ||
        `${classification.categoryLabel} (${classification.type})`;

      // De-duplicate items with exact identical name and category in close proximity
      const dedupKey = `${name}_${classification.category}`;
      if (seenNames.has(dedupKey)) continue;
      seenNames.add(dedupKey);

      surroundings.push({
        id: `${el.type}/${el.id}`,
        name,
        category: classification.category,
        categoryLabel: classification.categoryLabel,
        type: classification.type,
        icon: classification.icon,
        badgeColor: classification.badgeColor,
        latitude: itemLat,
        longitude: itemLon,
        distanceMeters: Math.round(distanceMeters),
        distanceKm: parseFloat((distanceMeters / 1000).toFixed(2)),
      });
    }

    // Sort by distance (closest first)
    surroundings.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // Compute category counts
    const counts = {
      total: surroundings.length,
      industrial: surroundings.filter((s) => s.category === "industrial").length,
      education: surroundings.filter((s) => s.category === "education").length,
      healthcare: surroundings.filter((s) => s.category === "healthcare").length,
      emergency: surroundings.filter((s) => s.category === "emergency").length,
      residential: surroundings.filter((s) => s.category === "residential").length,
      environment: surroundings.filter((s) => s.category === "environment").length,
    };

    // Calculate Risk Assessment & Vulnerability Level
    let riskLevel = "LOW";
    let riskScore = 20;
    let riskReasons = [];

    const closeIndustrial = surroundings.filter(
      (s) => s.category === "industrial" && s.distanceKm <= 2.5
    );
    const closeSchools = surroundings.filter(
      (s) => s.category === "education" && s.distanceKm <= 2.0
    );
    const closeHospitals = surroundings.filter(
      (s) => s.category === "healthcare" && s.distanceKm <= 2.0
    );

    if (closeIndustrial.length > 0) {
      riskScore += 45;
      riskReasons.push(`${closeIndustrial.length} industrial facility within 2.5km`);
    }
    if (closeSchools.length > 0) {
      riskScore += 30;
      riskReasons.push(`${closeSchools.length} school(s) within 2.0km`);
    }
    if (closeHospitals.length > 0) {
      riskScore += 25;
      riskReasons.push(`${closeHospitals.length} hospital(s) within 2.0km`);
    }

    if (riskScore >= 75) {
      riskLevel = "CRITICAL";
    } else if (riskScore >= 50) {
      riskLevel = "HIGH";
    } else if (riskScore >= 30) {
      riskLevel = "MODERATE";
    } else {
      riskLevel = "LOW";
    }

    const responseData = {
      center: {
        latitude: lat,
        longitude: lon,
        radiusMeters,
        radiusKm,
        locationName,
      },
      counts,
      riskAssessment: {
        level: riskLevel,
        score: Math.min(riskScore, 100),
        reasons: riskReasons,
        summary:
          riskReasons.length > 0
            ? riskReasons.join(" • ")
            : "No high-risk industrial or educational infrastructure in immediate 2km proximity.",
      },
      surroundings,
    };

    // Save in cache
    surroundingsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responseData,
    });

    res.json({
      success: true,
      cached: false,
      ...responseData,
    });
  } catch (error) {
    console.error("❌ Fire surroundings error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to query 5km surroundings",
      error: error.message,
    });
  }
});

module.exports = router;