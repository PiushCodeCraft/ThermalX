import React, { useState } from 'react';
import { Compass, ShieldAlert, Wind, Thermometer, Droplet, MapPin, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { AreaSearch } from './AreaSearch';

const nearAreaSectors = [
  {
    id: 'na-01',
    name: 'Peenya Industrial Buffer Zone 4',
    distance: '6.4 km',
    bearing: 'NW 315°',
    risk: 'HIGH',
    temp: 41.2,
    moisture: 22,
    windVector: '32 km/h NW',
    threat: 'Immediate Ember Threat',
    status: 'Pre-Evacuation Warning',
    statusColor: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'na-02',
    name: 'Hosur Dry Grassland Corridor',
    distance: '14.8 km',
    bearing: 'SE 140°',
    risk: 'HIGH',
    temp: 39.5,
    moisture: 19,
    windVector: '28 km/h NW',
    threat: 'Rapid Grass Fire Spread',
    status: 'Containment Line Active',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    id: 'na-03',
    name: 'Electronic City South Fringe',
    distance: '21.3 km',
    bearing: 'S 185°',
    risk: 'MEDIUM',
    temp: 36.8,
    moisture: 29,
    windVector: '20 km/h NW',
    threat: 'Downwind Particulate Drift',
    status: 'Active Surveillance',
    statusColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'na-04',
    name: 'Whitefield Commercial Perimeter',
    distance: '28.5 km',
    bearing: 'E 095°',
    risk: 'MEDIUM',
    temp: 35.1,
    moisture: 33,
    windVector: '18 km/h W',
    threat: 'Elevated Rooftop Temp',
    status: 'Nominal Sentry',
    statusColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  {
    id: 'na-05',
    name: 'Bannerghatta Ridge Reserve',
    distance: '34.2 km',
    bearing: 'SW 220°',
    risk: 'LOW',
    temp: 31.0,
    moisture: 48,
    windVector: '14 km/h S',
    threat: 'Natural Barrier Shield',
    status: 'Protected Flora Corridor',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
];

export const NearAreaMonitoring = ({
  activeTarget = 'Industrial Zone A, Bengaluru',
  maxHeight = 'max-h-[580px]',
  className = ''
}) => {
  const [selectedRadius, setSelectedRadius] = useState('50 km');
  const [searchQuery, setSearchQuery] = useState('');
  const [exported, setExported] = useState(false);

  const filteredSectors = nearAreaSectors.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.threat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportPerimeter = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className={`bg-white border border-slate-200 shadow-sm p-4 rounded-lg flex flex-col justify-between h-full ${className}`}>
      <div>
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-600">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] uppercase tracking-wide text-slate-900 leading-tight">
                Near Area Surveillance & Perimeter
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span>Origin Target:</span>
                <strong className="text-slate-800">{activeTarget}</strong>
              </p>
            </div>
          </div>

          {/* Proximity Radius Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-[11px] font-semibold">
            <span className="text-slate-500 uppercase px-1 text-[10px]">Radius:</span>
            {['15 km', '25 km', '50 km', '100 km'].map((radius) => (
              <button
                key={radius}
                onClick={() => setSelectedRadius(radius)}
                className={`px-2 py-0.5 rounded transition-all ${
                  selectedRadius === radius
                    ? 'bg-[#00236F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {radius}
              </button>
            ))}
          </div>
        </div>

        {/* Perimeter Risk Overview Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-2.5 bg-red-50/60 border border-red-200/80 rounded-md">
            <div className="flex items-center justify-between text-[11px] text-red-700 font-semibold mb-1">
              <span>Immediate Threat</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            </div>
            <span className="text-xl font-bold text-red-700 tabular-nums">2 Sectors</span>
            <span className="block text-[10px] text-red-600/90 mt-0.5">Within 15km perimeter</span>
          </div>

          <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-md">
            <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold mb-1">
              <span>Moderate Exposure</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-xl font-bold text-amber-800 tabular-nums">2 Sectors</span>
            <span className="block text-[10px] text-amber-700 mt-0.5">15km - 30km downwind</span>
          </div>

          <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-md">
            <div className="flex items-center justify-between text-[11px] text-blue-800 font-semibold mb-1">
              <span>Perimeter Containment</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-blue-800 tabular-nums">78.4%</span>
            <span className="block text-[10px] text-blue-600 mt-0.5">Firebreak barrier intact</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Filter near sectors, bearing, or threat vector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:outline-blue-600"
          />
        </div>

        {/* Adjacent Sectors Telemetry Feed */}
        <div className={`space-y-2.5 ${maxHeight} overflow-y-auto pr-1`}>
          {filteredSectors.map((sector) => (
            <div
              key={sector.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-md transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <RiskBadge risk={sector.risk} />
                    <h4 className="font-bold text-[13px] text-slate-900 leading-tight">
                      {sector.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="font-mono text-slate-800 font-semibold">
                      Distance: {sector.distance}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-700">Bearing: {sector.bearing}</span>
                    <span>•</span>
                    <span className="text-red-600 font-medium">{sector.threat}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase whitespace-nowrap ${sector.statusColor}`}
                >
                  {sector.status}
                </span>
              </div>

              {/* Telemetry Micro-Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Thermometer className="w-3.5 h-3.5 text-red-500" />
                  <span>Ambient:</span>
                  <strong className="text-slate-900 tabular-nums">{sector.temp}°C</strong>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  <span>RH:</span>
                  <strong className="text-slate-900 tabular-nums">{sector.moisture}%</strong>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  <span className="tabular-nums font-medium text-slate-800">{sector.windVector}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Showing <strong>{filteredSectors.length}</strong> near sectors within {selectedRadius} surveillance zone
        </span>

        <button
          onClick={handleExportPerimeter}
          className="px-3.5 py-1.5 bg-[#00236F] hover:bg-[#1E3A8A] text-white text-[11px] font-bold uppercase rounded flex items-center gap-1.5 transition-colors shadow-xs"
          type="button"
        >
          <Download className="w-3.5 h-3.5 text-blue-200" />
          <span>{exported ? 'Perimeter Log Exported' : 'Export Near Area Log'}</span>
        </button>
      </div>
    </div>
  );
};
