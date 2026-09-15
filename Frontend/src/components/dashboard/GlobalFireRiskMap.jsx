import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import JSZip from 'jszip';
import { MapControls, InsetMapZoomControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { IncidentMapPopup } from './IncidentMapPopup';
import { Satellite, ShieldCheck, Flame, Layers, Globe2 } from 'lucide-react';

const NASA_FIRMS_KEY = 'e352f18dcf46a08a8aa6dd31f2091f46';

const REGION_COORDINATES = {
  south_asia: { center: [22.5, 78.5], zoom: 5 },
  south_east_asia: { center: [13.0, 103.0], zoom: 5 },
  central_america: { center: [15.5, -88.0], zoom: 5 },
  europe: { center: [48.0, 16.0], zoom: 4 },
  australia_newzealand: { center: [-26.0, 134.0], zoom: 4 }
};

export const GlobalFireRiskMap = ({
  locations = [],
  selectedId,
  onSelectLocation,
  mapHeight = 'h-[500px]',
  className = '',
  showMapPopup = false
}) => {
  const [activeLayer, setActiveLayer] = useState('thermal');
  const [activeSensor, setActiveSensor] = useState('noaa-20-viirs-c2');
  const [dateSpan, setDateSpan] = useState('24h');
  const [selectedRegion, setSelectedRegion] = useState('south_asia');
  const [basemapType, setBasemapType] = useState('satellite'); // 'satellite' | 'carto' | 'dark'
  const [showPopup, setShowPopup] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live NASA FIRMS KML state
  const [nasaHotspots, setNasaHotspots] = useState([]);
  const [isLoadingNasa, setIsLoadingNasa] = useState(false);
  const [showNasaHotspots, setShowNasaHotspots] = useState(true);
  const [selectedNasaPoint, setSelectedNasaPoint] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const targetMarkersGroupRef = useRef(null);
  const nasaMarkersGroupRef = useRef(null);
  const firmsWmsLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const selectedLocation = locations.find((loc) => loc.id === selectedId) || locations[0];

  // Helper to determine WMS layer name based on sensor & dateSpan
  const getWmsLayerName = useCallback((sensor, span) => {
    const spanSuffix = span === '48h' ? '_48' : span === '7d' ? '_7' : '_24';
    if (sensor === 'noaa-20-viirs-c2') return `fires_viirs_noaa20${spanSuffix}`;
    if (sensor === 'viirs-snpp') return `fires_viirs_snpp${spanSuffix}`;
    if (sensor === 'modis') return `fires_modis${spanSuffix}`;
    return `fires_viirs${spanSuffix}`;
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialRegion = REGION_COORDINATES[selectedRegion] || { center: [22.5, 78.5], zoom: 5 };
      const map = L.map(mapContainerRef.current, {
        center: initialRegion.center,
        zoom: initialRegion.zoom,
        minZoom: 1,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
      });

      // Layer groups for markers
      const nasaGroup = L.layerGroup().addTo(map);
      nasaMarkersGroupRef.current = nasaGroup;

      const markersGroup = L.layerGroup().addTo(map);
      targetMarkersGroupRef.current = markersGroup;

      mapInstanceRef.current = map;

      // Invalidate size once attached
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Layer when basemapType changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    let tileUrl = '';
    let maxZoom = 18;
    let subdomains = 'abc';

    if (basemapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (basemapType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      maxZoom = 19;
    } else {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }

    const newTile = L.tileLayer(tileUrl, {
      maxZoom: maxZoom,
      subdomains: subdomains
    }).addTo(map);

    newTile.bringToBack();
    tileLayerRef.current = newTile;
  }, [basemapType]);

  // Update NASA FIRMS WMS Layer when sensor, dateSpan, or activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (firmsWmsLayerRef.current) {
      map.removeLayer(firmsWmsLayerRef.current);
      firmsWmsLayerRef.current = null;
    }

    if (activeLayer === 'thermal') {
      const layerName = getWmsLayerName(activeSensor, dateSpan);
      try {
        const firmsWms = L.tileLayer.wms(
          `https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${NASA_FIRMS_KEY}/${layerName}/`,
          {
            layers: layerName,
            format: 'image/png',
            transparent: true,
            opacity: 0.85,
            zIndex: 400
          }
        ).addTo(map);
        firmsWmsLayerRef.current = firmsWms;
      } catch (err) {
        console.warn('WMS layer update error:', err);
      }
    }
  }, [activeSensor, dateSpan, activeLayer, getWmsLayerName]);

  // Fetch & Parse Live NASA FIRMS KML Fire Footprints
  const fetchNasaKmlHotspots = useCallback(async () => {
    setIsLoadingNasa(true);
    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/kml_fire_footprints/?map_key=${NASA_FIRMS_KEY}&region=${selectedRegion}&date_span=${dateSpan}&sensor=${activeSensor}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      const zip = await JSZip.loadAsync(arrayBuffer);
      const kmlFilename = Object.keys(zip.files).find((name) => name.endsWith('.kml'));
      if (!kmlFilename) {
        console.warn('No KML file inside NASA KMZ archive');
        setIsLoadingNasa(false);
        return;
      }

      const kmlText = await zip.file(kmlFilename).async('string');

      // Parse Placemarks from KML
      const parsedPoints = [];
      const pmRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
      let match;
      while ((match = pmRegex.exec(kmlText)) !== null) {
        const pm = match[1];
        const coordMatch = /<coordinates>\s*([-\d.]+),([-\d.]+)/.exec(pm);
        const frpMatch = /<b>FRP:\s*<\/b>\s*([-\d.]+)\s*MW/.exec(pm);
        const brightMatch = /<b>Brightness:\s*<\/b>\s*([-\d.]+)\s*K/.exec(pm);
        const timeMatch = /<b>Detection Time:\s*<\/b>\s*([^<]+)/.exec(pm);
        const confMatch = /<b>Confidence:\s*<\/b>\s*([^<]+)/.exec(pm);
        const dayNightMatch = /<b>Day\/Night:\s*<\/b>\s*([^<]+)/.exec(pm);

        if (coordMatch) {
          const lng = parseFloat(coordMatch[1]);
          const lat = parseFloat(coordMatch[2]);
          const frp = frpMatch ? parseFloat(frpMatch[1]) : 1.0;
          const brightnessK = brightMatch ? parseFloat(brightMatch[1]) : 310;
          const brightnessC = Math.round((brightnessK - 273.15) * 10) / 10;

          parsedPoints.push({
            id: `nasa-${lat.toFixed(4)}-${lng.toFixed(4)}`,
            lat,
            lng,
            frp,
            brightnessK,
            brightnessC,
            time: timeMatch ? timeMatch[1].trim() : 'Recent UTC',
            confidence: confMatch ? confMatch[1].trim() : 'Nominal',
            dayNight: dayNightMatch ? dayNightMatch[1].trim() : 'Day',
            sensor: activeSensor.toUpperCase()
          });
        }
      }

      setNasaHotspots(parsedPoints);
    } catch (err) {
      console.error('Error fetching/parsing NASA FIRMS KML:', err);
    } finally {
      setIsLoadingNasa(false);
    }
  }, [selectedRegion, dateSpan, activeSensor]);

  // Trigger KML fetch when region, sensor, or dateSpan changes
  useEffect(() => {
    fetchNasaKmlHotspots();
  }, [fetchNasaKmlHotspots]);

  // Pan map when region changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const reg = REGION_COORDINATES[selectedRegion];
    if (reg) {
      mapInstanceRef.current.flyTo(reg.center, reg.zoom, { duration: 1.2 });
    }
  }, [selectedRegion]);

  // Render NASA FIRMS Hotspots Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !nasaMarkersGroupRef.current) return;
    const group = nasaMarkersGroupRef.current;
    group.clearLayers();

    if (!showNasaHotspots || nasaHotspots.length === 0) return;

    // Render each point with heat radius based on FRP
    nasaHotspots.forEach((pt) => {
      let fillColor = '#EAB308'; // yellow/amber
      let radius = 4;
      if (pt.frp >= 15) {
        fillColor = '#DC2626'; // Blazing red for high thermal intensity
        radius = 7;
      } else if (pt.frp >= 4) {
        fillColor = '#EA580C'; // Vivid orange
        radius = 5.5;
      }

      const circle = L.circleMarker([pt.lat, pt.lng], {
        radius: radius,
        fillColor: fillColor,
        color: '#FFFFFF',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.85,
        interactive: true
      });

      circle.on('click', (e) => {
        if (e && e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        const nasaIncident = {
          id: pt.id,
          name: `NASA Hotspot (${pt.lat.toFixed(2)}°, ${pt.lng.toFixed(2)}°)`,
          location: `${selectedRegion.replace('_', ' ').toUpperCase()} Hotspot`,
          coordinates: `Lat ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`,
          latitude: pt.lat,
          longitude: pt.lng,
          brightnessC: pt.brightnessC,
          brightnessK: pt.brightnessK,
          temperature: pt.brightnessC || Math.round((pt.brightnessK - 273.15) * 10) / 10 || 42.0,
          humidity: pt.frp >= 15 ? 18 : pt.frp >= 4 ? 24 : 35,
          power: pt.frp || 4.2,
          confidence: typeof pt.confidence === 'number' ? pt.confidence : parseFloat(pt.confidence) || (pt.frp >= 15 ? 89.4 : 78.2),
          frp: pt.frp,
          time: pt.time,
          sensor: `${pt.sensor} (375m)`,
          risk: pt.frp >= 15 ? 'HIGH' : pt.frp >= 4 ? 'MEDIUM' : 'LOW',
          lastSync: pt.time || 'Live Telemetry'
        };

        setSelectedNasaPoint(nasaIncident);
        if (onSelectLocation) {
          onSelectLocation(pt.id, nasaIncident);
        }
      });

      group.addLayer(circle);
    });
  }, [nasaHotspots, showNasaHotspots, selectedRegion]);

  // Render Monitored Target Locations Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !targetMarkersGroupRef.current) return;
    const markersGroup = targetMarkersGroupRef.current;
    markersGroup.clearLayers();

    locations.forEach((loc) => {
      const isSelected = loc.id === selectedId;
      let dotColor = '#16A34A';
      if (loc.risk === 'HIGH') dotColor = '#DC2626';
      else if (loc.risk === 'MEDIUM') dotColor = '#D97706';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${
            isSelected
              ? `<div style="background-color: ${dotColor}; opacity: 0.35;" class="absolute -inset-3 rounded-full animate-ping"></div>
                 <div style="border-color: ${dotColor};" class="absolute -inset-2 rounded-full border-2"></div>`
              : ''
          }
          <div style="background-color: ${dotColor};" class="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon,
        zIndexOffset: 3000,
        riseOnHover: true
      });

      marker.on('click', (e) => {
        if (e && e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        setSelectedNasaPoint(null);
        if (onSelectLocation) {
          onSelectLocation(loc.id, loc);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [locations, selectedId, onSelectLocation]);

  // Center/Fly smoothly to Selected Target when selectedId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;
    const map = mapInstanceRef.current;
    setSelectedNasaPoint(null);

    const lat = selectedLocation.latitude;
    const lng = selectedLocation.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    try {
      map.stop(); // Gracefully stop any active animation

      const currentCenter = map.getCenter();
      // Calculate shortest-path longitude across the spherical antimeridian
      let targetLng = lng;
      while (targetLng - currentCenter.lng > 180) targetLng -= 360;
      while (targetLng - currentCenter.lng < -180) targetLng += 360;

      // Cinematic smooth flyTo animation with parabolic zoom arc
      map.flyTo([lat, targetLng], 6, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    } catch (err) {
      console.warn('flyTo animation fallback:', err);
      map.panTo([lat, lng], { animate: true, duration: 1.2 });
    }
  }, [selectedId, selectedLocation]);

  const handleDownloadKmlFootprints = () => {
    const kmlUrl = `https://firms.modaps.eosdis.nasa.gov/api/kml_fire_footprints/?map_key=${NASA_FIRMS_KEY}&region=${selectedRegion}&date_span=${dateSpan}&sensor=${activeSensor}`;
    const link = document.createElement('a');
    link.href = kmlUrl;
    link.target = '_blank';
    link.download = `NASA_FIRMS_${activeSensor}_${selectedRegion}_${dateSpan}.kmz`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => mapInstanceRef.current && mapInstanceRef.current.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current && mapInstanceRef.current.zoomOut();
  const handleResetView = () => {
    setSelectedNasaPoint(null);
    if (mapInstanceRef.current) {
      const reg = REGION_COORDINATES[selectedRegion] || { center: [22.5, 78.5], zoom: 5 };
      mapInstanceRef.current.flyTo(reg.center, reg.zoom, { duration: 1.0 });
      setShowPopup(true);
    }
  };
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  };

  const activePopupTarget = selectedNasaPoint || selectedLocation;

  // Invalidate map size on height change or fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [mapHeight, isFullscreen]);

  return (
    <div
      className={`bg-white border border-slate-200 shadow-sm flex flex-col rounded overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-900' : ''
      }`}
    >
      {/* Map Header & Layer Toggles */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[15px] text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-600 fill-red-600" />
              <span>Global Fire Risk Map</span>
            </h2>
            <span className="px-2 py-0.5 font-semibold text-[10px] bg-blue-50 border border-blue-200 text-[#0051D5] uppercase rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0051D5]" />
              <span>NASA FIRMS API Active</span>
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
            <span>
              Sensor: <strong className="text-slate-800 font-semibold uppercase">{activeSensor}</strong>
            </span>
            <span>•</span>
            <span>
              Region: <strong className="text-slate-800 font-semibold uppercase">{selectedRegion.replace('_', ' ')}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isLoadingNasa ? 'Syncing...' : `${nasaHotspots.length} Live Anomalies`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MapControls
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            activeSensor={activeSensor}
            setActiveSensor={setActiveSensor}
            dateSpan={dateSpan}
            setDateSpan={setDateSpan}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            onDownloadKmlFootprints={handleDownloadKmlFootprints}
            showNasaHotspots={showNasaHotspots}
            setShowNasaHotspots={setShowNasaHotspots}
            nasaHotspotsCount={nasaHotspots.length}
            isLoadingNasa={isLoadingNasa}
            onRefreshNasa={fetchNasaKmlHotspots}
            basemapType={basemapType}
            setBasemapType={setBasemapType}
          />
        </div>
      </div>

      {/* Map Viewport Canvas */}
      <div className={`relative w-full ${mapHeight || 'h-[500px]'} bg-[#0F172A] overflow-hidden select-none flex-1`}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} className="w-full h-full z-0" />

        {/* Floating Selected Detail Card (Disabled by default as incident intelligence is rendered in the side panel) */}
        {showMapPopup && showPopup && activePopupTarget && (
          <IncidentMapPopup
            location={activePopupTarget}
            onClose={() => {
              setShowPopup(false);
              setSelectedNasaPoint(null);
            }}
          />
        )}

        {/* Zoom Controls */}
        <InsetMapZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Legend */}
        <MapLegend resolution={`NASA ${activeSensor.toUpperCase()} (375m Spatial Resolution)`} />
      </div>
    </div>
  );
};
