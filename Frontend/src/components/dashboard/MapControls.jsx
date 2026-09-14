import React from 'react';
import {
  Thermometer,
  Leaf,
  Wind,
  Plus,
  Minus,
  RotateCcw,
  Maximize2,
  Download,
  Radio,
  Globe2,
  Flame,
  RefreshCw,
  Satellite
} from 'lucide-react';

export const MapControls = ({
  activeLayer,
  setActiveLayer,
  activeSensor = 'noaa-20-viirs-c2',
  setActiveSensor,
  dateSpan = '24h',
  setDateSpan,
  selectedRegion = 'south_asia',
  setSelectedRegion,
  onDownloadKmlFootprints,
  showNasaHotspots = true,
  setShowNasaHotspots,
  nasaHotspotsCount = 0,
  isLoadingNasa = false,
  onRefreshNasa,
  basemapType = 'satellite',
  setBasemapType
}) => {
  const layers = [
    { id: 'thermal', label: 'Thermal WMS', icon: Thermometer },
    { id: 'veg', label: 'Veg Dryness', icon: Leaf },
    { id: 'wind', label: 'Wind Vectors', icon: Wind }
  ];

  const sensors = [
    { id: 'noaa-20-viirs-c2', label: 'NOAA-20 VIIRS C2', code: 'noaa-20-viirs-c2' },
    { id: 'viirs-snpp', label: 'VIIRS SNPP', code: 'viirs-snpp' },
    { id: 'modis', label: 'MODIS C6.1', code: 'modis' }
  ];

  const regions = [
    { id: 'south_asia', label: 'South Asia' },
    { id: 'south_east_asia', label: 'SE Asia' },
    { id: 'central_america', label: 'Central America' },
    { id: 'europe', label: 'Europe' },
    { id: 'australia_newzealand', label: 'Australia / NZ' }
  ];

  const dateSpans = [
    { id: '24h', label: '24 Hours' },
    { id: '48h', label: '48 Hours' },
    { id: '7d', label: '7 Days' }
  ];

  return (
    <div className="flex flex-col gap-2 w-full lg:w-auto">
      {/* Top Row: NASA FIRMS Telemetry Controls (Region, Sensor, DateSpan, Live Hotspots) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Region Selector */}
        {setSelectedRegion && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px]">
            <span className="px-1.5 text-[10px] text-slate-500 uppercase flex items-center gap-1 font-semibold">
              <Globe2 className="w-3 h-3 text-[#0051D5]" /> Region:
            </span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-white border-0 text-slate-800 text-[11px] font-semibold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sensor Switcher */}
        {setActiveSensor && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-semibold">
            <span className="px-1.5 text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-600 animate-pulse" /> Sensor:
            </span>
            {sensors.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSensor(s.id)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  activeSensor === s.id
                    ? 'bg-red-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Date Span Switcher */}
        {setDateSpan && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-semibold">
            {dateSpans.map((d) => (
              <button
                key={d.id}
                onClick={() => setDateSpan(d.id)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  dateSpan === d.id
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Live NASA Hotspots Toggle & Refresh */}
        {setShowNasaHotspots && (
          <button
            onClick={() => setShowNasaHotspots(!showNasaHotspots)}
            className={`h-7 px-2.5 text-[11px] font-semibold rounded flex items-center gap-1.5 transition-colors border cursor-pointer ${
              showNasaHotspots
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            type="button"
            title="Toggle NASA FIRMS Live Thermal Detections"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                showNasaHotspots ? 'text-red-600 fill-red-600 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span>
              {isLoadingNasa ? 'Loading...' : `NASA Hotspots (${nasaHotspotsCount})`}
            </span>
            {onRefreshNasa && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRefreshNasa();
                }}
                className="ml-0.5 hover:text-red-900 p-0.5 rounded"
                title="Refresh live NASA data"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingNasa ? 'animate-spin' : ''}`} />
              </span>
            )}
          </button>
        )}
      </div>

      {/* Bottom Row: KML Footprints + Layer Filters + Basemap Switcher (Positioned Right After Wind Vectors) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* KML Footprints Download Button */}
        {onDownloadKmlFootprints && (
          <button
            onClick={onDownloadKmlFootprints}
            className="h-7 px-2.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            type="button"
            title="Download NASA FIRMS KML Active Fire Footprints"
          >
            <Download className="w-3.5 h-3.5" />
            <span>KML Footprints</span>
          </button>
        )}

        {/* Layer Selectors: Thermal WMS, Veg Dryness, Wind Vectors */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 rounded transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                type="button"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Basemap Switcher: Placed directly after Wind Vectors */}
        {setBasemapType && (
          <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => setBasemapType('satellite')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                basemapType === 'satellite'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              type="button"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setBasemapType('carto')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                basemapType === 'carto'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              type="button"
            >
              GIS Light
            </button>
            <button
              onClick={() => setBasemapType('dark')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                basemapType === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              type="button"
            >
              Dark Tactical
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const InsetMapZoomControls = ({ onZoomIn, onZoomOut, onResetView, onToggleFullscreen }) => {
  return (
    <div className="absolute top-3 right-3 flex flex-col bg-white border border-slate-200 shadow-sm rounded z-10">
      <button
        onClick={onZoomIn}
        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Zoom In"
        type="button"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Zoom Out"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={onResetView}
        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
        title="Reset View"
        type="button"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        title="Fullscreen"
        type="button"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
