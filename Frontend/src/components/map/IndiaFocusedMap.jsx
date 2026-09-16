import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";

import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";

import GeoJSON from "ol/format/GeoJSON";

import { Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";

import {
  defaults as defaultControls,
  Zoom,
} from "ol/control";

import {
  Satellite,
  Map as MapIcon,
  RefreshCw,
  Radio,
} from "lucide-react";

import "ol/ol.css";
import "./IndiaFocusedMap.css";

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
   COMPONENT
========================================================= */

const IndiaFocusedMap = ({
  height = "100%",
}) => {
  const mapElementRef =
    useRef(null);

  const mapRef =
    useRef(null);

  const satelliteLayerRef =
    useRef(null);

  const streetLayerRef =
    useRef(null);

  const firmsLayerRef =
    useRef(null);

  const [mapMode, setMapMode] =
    useState("satellite");

  const [firmsStatus, setFirmsStatus] =
    useState(
      FIRMS_MAP_KEY
        ? "LOADING"
        : "NO MAP KEY"
    );

  /* =======================================================
     CREATE MAP
  ======================================================= */

  useEffect(() => {
    if (
      !mapElementRef.current ||
      mapRef.current
    ) {
      return;
    }

    /* =====================================================
       ESRI SATELLITE
    ===================================================== */

    const satelliteLayer =
      new TileLayer({
        source: new XYZ({
          url:
            "https://server.arcgisonline.com/" +
            "ArcGIS/rest/services/World_Imagery/" +
            "MapServer/tile/{z}/{y}/{x}",

          maxZoom: 19,

          crossOrigin: "anonymous",

          attributions:
            "Tiles © Esri",
        }),

        visible: true,

        opacity: 1,

        zIndex: 0,
      });

    satelliteLayerRef.current =
      satelliteLayer;

    /* =====================================================
       OPENSTREETMAP
    ===================================================== */

    const streetLayer =
      new TileLayer({
        source: new XYZ({
          url:
            "https://tile.openstreetmap.org/" +
            "{z}/{x}/{y}.png",

          maxZoom: 19,

          crossOrigin: "anonymous",

          attributions:
            "© OpenStreetMap contributors",
        }),

        visible: false,

        opacity: 1,

        zIndex: 0,
      });

    streetLayerRef.current =
      streetLayer;

    /* =====================================================
       SATELLITE ERROR HANDLER
    ===================================================== */

    satelliteLayer
      .getSource()
      .on(
        "tileloaderror",
        () => {
          console.warn(
            "Esri satellite tile failed."
          );
        }
      );

    /* =====================================================
       NASA FIRMS
    ===================================================== */

    let firmsLayer = null;

    if (FIRMS_MAP_KEY) {
      firmsLayer =
        new TileLayer({
          source: new TileWMS({
            url: FIRMS_WMS_URL,

            params: {
              LAYERS:
                FIRMS_LAYER,

              VERSION:
                "1.1.1",

              FORMAT:
                "image/png",

              TRANSPARENT:
                true,
            },

            serverType:
              "mapserver",

            crossOrigin:
              "anonymous",

            transition: 0,

            tilePixelRatio: 1,
          }),

          visible: true,

          opacity: 1,

          zIndex: 20,
        });

      firmsLayerRef.current =
        firmsLayer;

      const firmsSource =
        firmsLayer.getSource();

      firmsSource.on(
        "tileloadstart",
        () => {
          setFirmsStatus(
            "LOADING"
          );
        }
      );

      firmsSource.on(
        "tileloadend",
        () => {
          setFirmsStatus(
            "LIVE"
          );
        }
      );

      firmsSource.on(
        "tileloaderror",
        () => {
          setFirmsStatus(
            "ERROR"
          );

          console.error(
            "NASA FIRMS WMS tile failed."
          );
        }
      );
    }

    /* =====================================================
       INDIA BORDER
    ===================================================== */

    const indiaLayer =
      new VectorLayer({
        source:
          createIndiaSource(),

        style:
          INDIA_STYLE,

        zIndex: 30,
      });

    /* =====================================================
       MAP
    ===================================================== */

    const map =
      new Map({
        target:
          mapElementRef.current,

        layers: [
          satelliteLayer,
          streetLayer,
          ...(firmsLayer
            ? [firmsLayer]
            : []),
          indiaLayer,
        ],

        controls:
          defaultControls({
            zoom: false,
            rotate: false,
            attribution: true,
          }).extend([
            new Zoom({
              className:
                "tx-openlayers-zoom",
            }),
          ]),

        view:
          new View({
            center:
              fromLonLat(
                INDIA_CENTER
              ),

            zoom:
              INDIA_ZOOM,

            minZoom: 3,

            maxZoom: 19,

            constrainResolution:
              false,
          }),
      });

    mapRef.current =
      map;

    /* =====================================================
       FIT INDIA
    ===================================================== */

    const indiaSource =
      indiaLayer.getSource();

    const extent =
      indiaSource.getExtent();

    if (
      extent &&
      extent.every(
        Number.isFinite
      )
    ) {
      map
        .getView()
        .fit(
          extent,
          {
            padding: [
              30,
              30,
              30,
              30,
            ],

            maxZoom:
              5.1,

            duration: 0,
          }
        );
    }

    /* =====================================================
       FORCE MAP RESIZE
    ===================================================== */

    const resizeMap = () => {
      if (
        mapRef.current
      ) {
        mapRef.current.updateSize();
        mapRef.current.renderSync();
      }
    };

    window.addEventListener(
      "resize",
      resizeMap
    );

    /* Dashboard layout can change size after mount */
    requestAnimationFrame(
      resizeMap
    );

    setTimeout(
      resizeMap,
      100
    );

    setTimeout(
      resizeMap,
      300
    );

    setTimeout(
      resizeMap,
      700
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      window.removeEventListener(
        "resize",
        resizeMap
      );

      map.setTarget(
        null
      );

      mapRef.current =
        null;
    };
  }, []);

  /* =======================================================
     BASEMAP SWITCH
  ======================================================= */

  useEffect(() => {
    if (
      !satelliteLayerRef.current ||
      !streetLayerRef.current
    ) {
      return;
    }

    const satellite =
      satelliteLayerRef.current;

    const street =
      streetLayerRef.current;

    if (
      mapMode === "satellite"
    ) {
      satellite.setVisible(
        true
      );

      street.setVisible(
        false
      );
    } else {
      satellite.setVisible(
        false
      );

      street.setVisible(
        true
      );
    }

    if (mapRef.current) {
      mapRef.current.updateSize();
      mapRef.current.renderSync();
    }
  }, [mapMode]);

  /* =======================================================
     REFRESH FIRMS
  ======================================================= */

  const refreshFirms = () => {
    if (
      !firmsLayerRef.current
    ) {
      return;
    }

    setFirmsStatus(
      "LOADING"
    );

    firmsLayerRef.current
      .getSource()
      .refresh();
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusClass = () => {
    if (
      firmsStatus === "LIVE"
    ) {
      return "tx-firms-live";
    }

    if (
      firmsStatus === "ERROR" ||
      firmsStatus === "NO MAP KEY"
    ) {
      return "tx-firms-error";
    }

    return "tx-firms-loading";
  };

  const getStatusText = () => {
    if (
      firmsStatus === "LIVE"
    ) {
      return "NASA FIRMS LIVE";
    }

    if (
      firmsStatus === "ERROR"
    ) {
      return "NASA FIRMS ERROR";
    }

    if (
      firmsStatus === "NO MAP KEY"
    ) {
      return "NASA FIRMS KEY MISSING";
    }

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

      {/* MAP */}

      <div
        ref={mapElementRef}
        className="tx-india-map"
      />

      {/* BASEMAP SWITCH */}

      <div className="tx-map-top-controls">

        <div className="tx-map-mode-switch">

          <button
            type="button"
            className={
              mapMode === "satellite"
                ? "active"
                : ""
            }
            onClick={() =>
              setMapMode(
                "satellite"
              )
            }
          >
            <Satellite
              size={15}
            />

            Satellite
          </button>

          <button
            type="button"
            className={
              mapMode === "street"
                ? "active"
                : ""
            }
            onClick={() =>
              setMapMode(
                "street"
              )
            }
          >
            <MapIcon
              size={15}
            />

            Street
          </button>

        </div>

      </div>

      {/* NASA STATUS */}

      <div className="tx-firms-status">

        <div
          className={`tx-firms-status-indicator ${getStatusClass()}`}
        >
          <Radio
            size={13}
          />

          <span>
            {getStatusText()}
          </span>
        </div>

        {FIRMS_MAP_KEY && (
          <button
            type="button"
            className="tx-firms-refresh"
            onClick={
              refreshFirms
            }
            title="Refresh NASA FIRMS"
          >
            <RefreshCw
              size={14}
            />
          </button>
        )}

      </div>

      {/* LEGEND */}

      <div className="tx-map-legend">

        <div className="tx-map-legend-title">
          Thermal Activity
        </div>

        <div className="tx-map-legend-item">

          <span className="tx-legend-fire" />

          <span>
            NASA FIRMS Detection
          </span>

        </div>

        <div className="tx-map-legend-item">

          <span className="tx-legend-boundary" />

          <span>
            India Boundary
          </span>

        </div>

      </div>

    </div>
  );
};

export default IndiaFocusedMap;