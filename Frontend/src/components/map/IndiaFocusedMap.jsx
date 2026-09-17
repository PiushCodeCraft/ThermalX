import React, { useEffect, useRef, useState, useCallback } from "react";

import Map from "ol/Map";
import View from "ol/View";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";

import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { circular } from "ol/geom/Polygon";

import { Fill, Stroke, Style, Circle as CircleStyle, Text } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";

import {
  defaults as defaultControls,
  Zoom,
} from "ol/control";

import {
  Satellite,
  Map as MapIcon,
  RefreshCw,
  Radio,
  Flame,
  Layers,
  Crosshair,
} from "lucide-react";

import "ol/ol.css";
import "./IndiaFocusedMap.css";

import ThermalSurroundingsPanel from "./ThermalSurroundingsPanel";
import indiaBoundary from "../../data/indiaBoundary.json";

/* =========================================================
   NASA FIRMS
========================================================= */

const FIRMS_MAP_KEY =
  import.meta.env.VITE_NASA_FIRMS_MAP_KEY;

const FIRMS_WMS_URL = FIRMS_MAP_KEY
  ? `https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${FIRMS_MAP_KEY}/`
  : "";

const FIRMS_LAYER =
  "fires_viirs_noaa21_24";

/* =========================================================
   INDIA
========================================================= */

const INDIA_CENTER = [
  79,
  22.5,
];

const INDIA_ZOOM = 4.8;

/* =========================================================
   INDIA BORDER
========================================================= */

const INDIA_STYLE = new Style({
  fill: new Fill({
    color: "rgba(255, 122, 0, 0.025)",
  }),

  stroke: new Stroke({
    color: "#ff7a00",
    width: 2,
  }),
});

/* =========================================================
   INDIA SOURCE
========================================================= */

const createIndiaSource = () => {
  const format = new GeoJSON();

  const features =
    format.readFeatures(
      indiaBoundary,
      {
        featureProjection: "EPSG:3857",
      }
    );

  return new VectorSource({
    features,
  });
};

/* =========================================================
   HOTSPOT STYLES
========================================================= */

const createHotspotStyle = (frp = 0) => {
  const radius = Math.min(Math.max(5 + Math.sqrt(frp || 1) * 2, 6), 16);

  return [
    // Outer halo
    new Style({
      image: new CircleStyle({
        radius: radius + 4,
        fill: new Fill({
          color: "rgba(239, 68, 68, 0.25)",
        }),
      }),
    }),
    // Main dot
    new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({
          color: frp > 15 ? "#dc2626" : frp > 5 ? "#ea580c" : "#f97316",
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 1.8,
        }),
      }),
    }),
  ];
};

/* =========================================================
   COMPONENT
========================================================= */

const IndiaFocusedMap = ({
  height = "100%",
  selectedPoint = null,
  surroundingsData = null,
  surroundingsLoading,
  surroundingsError,
  onSelectPoint = null,
  onClosePoint = null,
  setFocusHandler = null,
}) => {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);

  const satelliteLayerRef = useRef(null);
  const streetLayerRef = useRef(null);
  const firmsLayerRef = useRef(null);

  // Vector layers for interactive points & 5km buffer
  const hotspotsLayerRef = useRef(null);
  const bufferLayerRef = useRef(null);
  const surroundingsLayerRef = useRef(null);

  const [mapMode, setMapMode] = useState("satellite");
  const [livePointsCount, setLivePointsCount] = useState(0);
  const [showHotspots, setShowHotspots] = useState(true);

  // Self-contained internal state so the popup works seamlessly in all pages
  // (User LiveMap, AdminDashboard, AdminLiveMap)
  const [internalSelectedPoint, setInternalSelectedPoint] = useState(null);
  const [internalSurroundingsData, setInternalSurroundingsData] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState(null);

  const activeSelectedPoint = selectedPoint || internalSelectedPoint;
  const activeSurroundingsData = surroundingsData || internalSurroundingsData;
  const activeLoading =
    surroundingsLoading !== undefined ? surroundingsLoading : internalLoading;
  const activeError =
    surroundingsError !== undefined ? surroundingsError : internalError;

  const [firmsStatus, setFirmsStatus] = useState(
    FIRMS_MAP_KEY ? "LOADING" : "NO MAP KEY"
  );

  /* =======================================================
     INTERNAL 5KM SURROUNDINGS FETCHER
  ======================================================= */

  const fetchSurroundingsInternal = useCallback(async (lat, lon) => {
    if (lat === undefined || lon === undefined) return;
    setInternalLoading(true);
    setInternalError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/fire/surroundings?lat=${lat}&lon=${lon}&radius=5000`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setInternalSurroundingsData(result);
      } else {
        setInternalError(result.message || "Failed to query 5km surroundings.");
      }
    } catch (err) {
      console.error("Surroundings query error:", err.message);
      setInternalError("Could not connect to surroundings service.");
    } finally {
      setInternalLoading(false);
    }
  }, []);

  const handlePointChosen = useCallback(
    (point) => {
      setInternalSelectedPoint(point);
      fetchSurroundingsInternal(point.latitude, point.longitude);
      if (onSelectPoint) {
        onSelectPoint(point);
      }
    },
    [fetchSurroundingsInternal, onSelectPoint]
  );

  /* =======================================================
     FETCH MONGODB LIVE THERMAL POINTS
  ======================================================= */

  const fetchLivePoints = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/fire/live-points?limit=300");
      if (!res.ok) return;

      const result = await res.json();
      if (!result.success || !Array.isArray(result.data)) return;

      setLivePointsCount(result.data.length);

      if (hotspotsLayerRef.current) {
        const source = hotspotsLayerRef.current.getSource();
        source.clear();

        const features = result.data.map((pt) => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([pt.longitude, pt.latitude])),
          });
          feature.set("type", "hotspot");
          feature.set("data", pt);
          feature.setStyle(createHotspotStyle(pt.frp));
          return feature;
        });

        source.addFeatures(features);
      }
    } catch (err) {
      console.warn("Could not fetch live points:", err.message);
    }
  }, []);

  /* =======================================================
     CREATE MAP
  ======================================================= */

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    /* ESRI SATELLITE */
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url:
          "https://server.arcgisonline.com/" +
          "ArcGIS/rest/services/World_Imagery/" +
          "MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
        crossOrigin: "anonymous",
        attributions: "Tiles © Esri",
      }),
      visible: true,
      opacity: 1,
      zIndex: 0,
    });
    satelliteLayerRef.current = satelliteLayer;

    /* OPENSTREETMAP */
    const streetLayer = new TileLayer({
      source: new XYZ({
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 19,
        crossOrigin: "anonymous",
        attributions: "© OpenStreetMap contributors",
      }),
      visible: false,
      opacity: 1,
      zIndex: 0,
    });
    streetLayerRef.current = streetLayer;

    /* NASA FIRMS WMS */
    let firmsLayer = null;
    if (FIRMS_MAP_KEY) {
      firmsLayer = new TileLayer({
        source: new TileWMS({
          url: FIRMS_WMS_URL,
          params: {
            LAYERS: FIRMS_LAYER,
            VERSION: "1.1.1",
            FORMAT: "image/png",
            TRANSPARENT: true,
          },
          serverType: "mapserver",
          crossOrigin: "anonymous",
          transition: 0,
          tilePixelRatio: 1,
        }),
        visible: true,
        opacity: 0.85,
        zIndex: 10,
      });
      firmsLayerRef.current = firmsLayer;

      const firmsSource = firmsLayer.getSource();
      firmsSource.on("tileloadstart", () => setFirmsStatus("LOADING"));
      firmsSource.on("tileloadend", () => setFirmsStatus("LIVE"));
      firmsSource.on("tileloaderror", () => setFirmsStatus("ERROR"));
    }

    /* INDIA BORDER */
    const indiaLayer = new VectorLayer({
      source: createIndiaSource(),
      style: INDIA_STYLE,
      zIndex: 15,
    });

    /* 5KM BUFFER RING & SELECTED POINT LAYER */
    const bufferSource = new VectorSource();
    const bufferLayer = new VectorLayer({
      source: bufferSource,
      zIndex: 25,
    });
    bufferLayerRef.current = bufferLayer;

    /* SURROUNDING POIS LAYER (within 5km) */
    const surroundingsSource = new VectorSource();
    const surroundingsLayer = new VectorLayer({
      source: surroundingsSource,
      zIndex: 30,
    });
    surroundingsLayerRef.current = surroundingsLayer;

    /* LIVE HOTSPOTS VECTOR LAYER */
    const hotspotsSource = new VectorSource();
    const hotspotsLayer = new VectorLayer({
      source: hotspotsSource,
      zIndex: 35,
      visible: true,
    });
    hotspotsLayerRef.current = hotspotsLayer;

    /* MAP INITIALIZATION */
    const map = new Map({
      target: mapElementRef.current,
      layers: [
        satelliteLayer,
        streetLayer,
        ...(firmsLayer ? [firmsLayer] : []),
        indiaLayer,
        bufferLayer,
        surroundingsLayer,
        hotspotsLayer,
      ],
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: true,
      }).extend([
        new Zoom({
          className: "tx-openlayers-zoom",
        }),
      ]),
      view: new View({
        center: fromLonLat(INDIA_CENTER),
        zoom: INDIA_ZOOM,
        minZoom: 3,
        maxZoom: 19,
        constrainResolution: false,
      }),
    });

    mapRef.current = map;

    /* FIT INDIA EXTENT */
    const extent = indiaLayer.getSource().getExtent();
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, {
        padding: [30, 30, 30, 30],
        maxZoom: 5.1,
        duration: 0,
      });
    }

    /* MAP CLICK INTERACTION */
    map.on("singleclick", (evt) => {
      let clickedHotspot = null;
      let clickedPoi = null;

      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => {
          const type = feature.get("type");
          if (type === "hotspot" && !clickedHotspot) {
            clickedHotspot = feature.get("data");
          } else if (type === "poi" && !clickedPoi) {
            clickedPoi = feature.get("data");
          }
        },
        { hitTolerance: 6 }
      );

      if (clickedHotspot) {
        handlePointChosen(clickedHotspot);
        return;
      }

      if (clickedPoi) {
        // Clicked a surrounding POI
        return;
      }

      // If clicked anywhere else on the map, query 5km surrounding around that exact coordinate!
      const [lon, lat] = toLonLat(evt.coordinate);
      handlePointChosen({
        id: `custom-${Date.now()}`,
        latitude: lat,
        longitude: lon,
        frp: 0,
        brightness: 0,
        satellite: "Custom Pin",
        acq_date: "Live Query",
        confidence: "custom",
        isCustom: true,
      });
    });

    /* HOVER CURSOR */
    map.on("pointermove", (evt) => {
      if (evt.dragging) return;
      const hit = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: (layer) =>
          layer === hotspotsLayerRef.current ||
          layer === surroundingsLayerRef.current,
        hitTolerance: 6,
      });
      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    /* RESIZE LISTENERS */
    const resizeMap = () => {
      if (mapRef.current) {
        mapRef.current.updateSize();
        mapRef.current.renderSync();
      }
    };

    window.addEventListener("resize", resizeMap);
    setTimeout(resizeMap, 200);

    // Initial fetch of points
    fetchLivePoints();

    return () => {
      window.removeEventListener("resize", resizeMap);
      map.setTarget(null);
      mapRef.current = null;
    };
  }, [fetchLivePoints, handlePointChosen]);

  /* =======================================================
     EXPOSE FOCUS HANDLER TO PARENT
  ======================================================= */

  useEffect(() => {
    if (!setFocusHandler) return;

    setFocusHandler((item) => {
      if (!mapRef.current || !item.latitude || !item.longitude) return;
      mapRef.current.getView().animate({
        center: fromLonLat([item.longitude, item.latitude]),
        zoom: Math.max(mapRef.current.getView().getZoom(), 13),
        duration: 700,
      });
    });
  }, [setFocusHandler]);

  /* =======================================================
     UPDATE 5KM BUFFER RING WHEN POINT IS SELECTED
  ======================================================= */

  useEffect(() => {
    if (!bufferLayerRef.current) return;
    const source = bufferLayerRef.current.getSource();
    source.clear();

    if (
      !activeSelectedPoint ||
      !activeSelectedPoint.latitude ||
      !activeSelectedPoint.longitude
    ) {
      return;
    }

    const lon = activeSelectedPoint.longitude;
    const lat = activeSelectedPoint.latitude;

    // 1. Create a true geodesic 5000 meter (5km) circle polygon
    const circlePolygon = circular([lon, lat], 5000, 72);
    circlePolygon.transform("EPSG:4326", "EPSG:3857");

    const circleFeature = new Feature({
      geometry: circlePolygon,
    });
    circleFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "#ea580c",
          width: 2,
          lineDash: [6, 4],
        }),
        fill: new Fill({
          color: "rgba(234, 88, 12, 0.08)",
        }),
      })
    );

    // 2. Central Pin Marker
    const centerPointFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });
    centerPointFeature.setStyle([
      // Outer pulse ring
      new Style({
        image: new CircleStyle({
          radius: 14,
          fill: new Fill({ color: "rgba(234, 88, 12, 0.25)" }),
          stroke: new Stroke({ color: "#ea580c", width: 1.5 }),
        }),
      }),
      // Inner glowing core
      new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: "#dc2626" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      }),
    ]);

    source.addFeatures([circleFeature, centerPointFeature]);

    // Animate map view to center the 5km zone nicely
    if (mapRef.current) {
      mapRef.current.getView().animate({
        center: fromLonLat([lon, lat]),
        zoom: Math.max(mapRef.current.getView().getZoom(), 11.5),
        duration: 600,
      });
    }
  }, [activeSelectedPoint]);

  /* =======================================================
     UPDATE SURROUNDINGS POI MARKERS
  ======================================================= */

  useEffect(() => {
    if (!surroundingsLayerRef.current) return;
    const source = surroundingsLayerRef.current.getSource();
    source.clear();

    if (
      !activeSurroundingsData ||
      !Array.isArray(activeSurroundingsData.surroundings) ||
      activeSurroundingsData.surroundings.length === 0
    ) {
      return;
    }

    const poiFeatures = activeSurroundingsData.surroundings.map((item) => {
      const feat = new Feature({
        geometry: new Point(fromLonLat([item.longitude, item.latitude])),
      });
      feat.set("type", "poi");
      feat.set("data", item);

      // Distinct styling by category
      feat.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: item.badgeColor || "#3b82f6",
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 2,
            }),
          }),
        })
      );

      return feat;
    });

    source.addFeatures(poiFeatures);
  }, [activeSurroundingsData]);

  /* =======================================================
     BASEMAP SWITCH
  ======================================================= */

  useEffect(() => {
    if (!satelliteLayerRef.current || !streetLayerRef.current) {
      return;
    }

    const satellite = satelliteLayerRef.current;
    const street = streetLayerRef.current;

    if (mapMode === "satellite") {
      satellite.setVisible(true);
      street.setVisible(false);
    } else {
      satellite.setVisible(false);
      street.setVisible(true);
    }

    if (mapRef.current) {
      mapRef.current.updateSize();
      mapRef.current.renderSync();
    }
  }, [mapMode]);

  /* =======================================================
     REFRESH FIRMS & POINTS
  ======================================================= */

  const refreshAll = () => {
    if (firmsLayerRef.current) {
      setFirmsStatus("LOADING");
      firmsLayerRef.current.getSource().refresh();
    }
    fetchLivePoints();
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusClass = () => {
    if (firmsStatus === "LIVE") return "tx-firms-live";
    if (firmsStatus === "ERROR" || firmsStatus === "NO MAP KEY")
      return "tx-firms-error";
    return "tx-firms-loading";
  };

  const getStatusText = () => {
    if (firmsStatus === "LIVE") return "NASA FIRMS LIVE";
    if (firmsStatus === "ERROR") return "NASA FIRMS ERROR";
    if (firmsStatus === "NO MAP KEY") return "NASA FIRMS KEY MISSING";
    return "NASA FIRMS LOADING";
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="tx-india-map-wrapper"
      style={{
        height,
      }}
    >
      {/* OPENLAYERS MAP */}
      <div ref={mapElementRef} className="tx-india-map" />

      {/* TOP CONTROLS */}
      <div className="tx-map-top-controls">
        <div className="tx-map-mode-switch">
          {/* HOTSPOTS TOGGLE */}
          <button
            type="button"
            className={showHotspots ? "active" : ""}
            onClick={() => {
              const next = !showHotspots;
              setShowHotspots(next);
              if (hotspotsLayerRef.current) {
                hotspotsLayerRef.current.setVisible(next);
              }
            }}
            title="Toggle Live Thermal Points from MongoDB"
          >
            <Flame size={14} />
            Hotspots ({livePointsCount})
          </button>

          {/* SATELLITE SWITCH */}
          <button
            type="button"
            className={mapMode === "satellite" ? "active" : ""}
            onClick={() => setMapMode("satellite")}
          >
            <Satellite size={14} />
            Satellite
          </button>

          {/* STREET SWITCH */}
          <button
            type="button"
            className={mapMode === "street" ? "active" : ""}
            onClick={() => setMapMode("street")}
          >
            <MapIcon size={14} />
            Street
          </button>
        </div>
      </div>

      {/* INTERACTION HINT PILL */}
      <div className="tx-map-interactive-hint">
        <Crosshair size={12} />
        <span>Click any thermal point or map area to inspect 5km surroundings</span>
      </div>

      {/* NASA STATUS */}
      <div className="tx-firms-status">
        <div className={`tx-firms-status-indicator ${getStatusClass()}`}>
          <Radio size={13} />
          <span>{getStatusText()}</span>
        </div>

        <button
          type="button"
          className="tx-firms-refresh"
          onClick={refreshAll}
          title="Refresh NASA FIRMS & Live Hotspots"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ENHANCED MAP LEGEND */}
      <div className="tx-map-legend">
        <div className="tx-map-legend-title">Map Layers & 5km Surroundings</div>

        <div className="tx-map-legend-item">
          <span className="tx-legend-hotspot" />
          <span>MongoDB Thermal Hotspot</span>
        </div>

        <div className="tx-map-legend-item">
          <span className="tx-legend-fire" />
          <span>NASA FIRMS WMS Overlay</span>
        </div>

        <div className="tx-map-legend-item">
          <span className="tx-legend-circle-5km" />
          <span>5km Vulnerability Buffer Ring</span>
        </div>

        <div className="tx-map-legend-item">
          <div className="tx-legend-poi-dots">
            <span style={{ background: "#ea580c" }} title="Industrial" />
            <span style={{ background: "#3b82f6" }} title="Education" />
            <span style={{ background: "#ec4899" }} title="Healthcare" />
            <span style={{ background: "#8b5cf6" }} title="Residential" />
          </div>
          <span>Surrounding POIs (5km)</span>
        </div>

        <div className="tx-map-legend-item">
          <span className="tx-legend-boundary" />
          <span>India Boundary</span>
        </div>
      </div>

      {/* 5KM SURROUNDINGS SLIDE-OUT INSPECTOR */}
      {activeSelectedPoint && (
        <ThermalSurroundingsPanel
          selectedPoint={activeSelectedPoint}
          surroundingsData={activeSurroundingsData}
          loading={activeLoading}
          error={activeError}
          onClose={() => {
            setInternalSelectedPoint(null);
            setInternalSurroundingsData(null);
            if (onClosePoint) onClosePoint();
          }}
          onRefresh={() => {
            if (activeSelectedPoint) {
              fetchSurroundingsInternal(
                activeSelectedPoint.latitude,
                activeSelectedPoint.longitude
              );
            }
          }}
          onFocusItem={(item) => {
            if (mapRef.current && item.latitude && item.longitude) {
              mapRef.current.getView().animate({
                center: fromLonLat([item.longitude, item.latitude]),
                zoom: Math.max(mapRef.current.getView().getZoom(), 13),
                duration: 600,
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default IndiaFocusedMap;