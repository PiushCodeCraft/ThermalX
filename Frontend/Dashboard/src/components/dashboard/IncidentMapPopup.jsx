import React from 'react';
import { Flame, ArrowRight, X, Satellite, Zap, Radio, Clock, Compass } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const IncidentMapPopup = ({ location, onClose, onViewDossier }) => {
  if (!location) return null;

  const isNasa = location.isNasaHotspot;

  return (
    <div className="absolute top-12 left-1/2 md:left-[54%] transform -translate-x-1/2 w-84 max-w-[92vw] z-30 pointer-events-auto transition-all duration-300 animate-in fade-in zoom-in-95">
      {/* Glassmorphic Container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950/75 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.65)] ring-1 ring-white/10 p-4 text-white">
        
        {/* Subtle Ambient Radial Light Effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative flex items-start justify-between gap-2 pb-3 mb-3 border-b border-white/10">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl flex items-center justify-center border shadow-inner ${
              isNasa 
                ? 'bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                : location.risk === 'HIGH'
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
            }`}>
              {isNasa ? (
                <Satellite className="w-4 h-4 animate-pulse" />
              ) : (
                <Flame className="w-4 h-4 fill-current" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-[14px] text-white tracking-tight leading-snug drop-shadow-xs">
                {location.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-0.5">
                <Compass className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{location.location || 'NASA FIRMS Detection'}</span>
              </div>
              <div className="text-[10px] text-cyan-300/90 font-mono mt-0.5 tracking-tight">
                {location.coordinates}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNasa ? (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/25 text-red-200 border border-red-400/30 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.25)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>NASA FIRMS</span>
              </span>
            ) : (
              <RiskBadge risk={location.risk} />
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Close Popup"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Glass Grid */}
        <div className="relative grid grid-cols-2 gap-2 mb-3">
          {/* Card 1: Temp */}
          <div className="bg-white/[0.07] hover:bg-white/[0.10] border border-white/10 rounded-xl p-2.5 backdrop-blur-md transition-all shadow-inner">
            <span className="block text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              {isNasa ? 'Brightness Temp' : 'Surface Temp'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="tabular-nums font-extrabold text-[15px] text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]">
                {isNasa
                  ? `${location.brightnessC !== undefined ? location.brightnessC : '--'}°C`
                  : `${location.temperature}°C`}
              </span>
              {isNasa && location.brightnessK && (
                <span className="text-[10px] text-slate-400 tabular-nums">
                  ({location.brightnessK} K)
                </span>
              )}
            </div>
          </div>

          {/* Card 2: FRP / Humidity */}
          <div className="bg-white/[0.07] hover:bg-white/[0.10] border border-white/10 rounded-xl p-2.5 backdrop-blur-md transition-all shadow-inner">
            <span className="block text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              {isNasa ? 'Fire Rad. Power' : 'Fuel Moisture'}
            </span>
            <span className="tabular-nums font-extrabold text-[15px] text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]">
              {isNasa ? `${location.frp || '--'} MW` : `${location.humidity}%`}
            </span>
          </div>

          {/* Card 3: Sensor Source / Power */}
          <div className="bg-white/[0.07] hover:bg-white/[0.10] border border-white/10 rounded-xl p-2.5 backdrop-blur-md transition-all shadow-inner">
            <span className="block text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              {isNasa ? 'Sensor Feed' : 'Radiative Power'}
            </span>
            <span className="tabular-nums font-bold text-[12px] text-sky-200 truncate block">
              {isNasa ? location.sensor || 'VIIRS NOAA-20' : `${location.power} MW`}
            </span>
          </div>

          {/* Card 4: Confidence */}
          <div className="bg-white/[0.07] hover:bg-white/[0.10] border border-white/10 rounded-xl p-2.5 backdrop-blur-md transition-all shadow-inner">
            <span className="block text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              {isNasa ? 'Detection Conf.' : 'ML Confidence'}
            </span>
            <span
              className={`tabular-nums font-bold text-[12.5px] ${
                location.confidence === 'High' || parseFloat(location.confidence) > 75
                  ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,0.4)]'
                  : 'text-amber-300'
              }`}
            >
              {isNasa ? location.confidence || 'Nominal' : `${location.confidence}%`}
            </span>
          </div>
        </div>

        {/* Footer Info & Action */}
        <div className="relative pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400">Detected:</span>
            <span className="font-mono text-[10.5px] text-white font-medium bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
              {isNasa ? location.time : location.lastSync}
            </span>
          </div>

          {!isNasa && onViewDossier && (
            <button
              type="button"
              onClick={() => onViewDossier(location)}
              className="text-cyan-300 hover:text-cyan-200 font-semibold hover:underline flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <span>Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
