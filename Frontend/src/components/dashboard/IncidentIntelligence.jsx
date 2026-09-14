import React, { useState } from 'react';
import { Brain, Thermometer, Droplet, Wind, Flame, AlertCircle, Send, CheckCircle } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const IncidentIntelligence = ({ incident }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  if (!incident) return null;

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setTimeout(() => setAcknowledged(false), 3000);
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3000);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm flex flex-col justify-between p-4 rounded h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-2 mb-3 bg-slate-50 p-2.5 rounded border border-slate-200">
          <div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-700" />
              <h3 className="font-semibold text-[14px] text-slate-900 leading-tight">
                Incident Intelligence
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ML-based fire propagation & risk assessment
            </p>
          </div>
          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-semibold rounded">
            Model v4.2 PRO
          </span>
        </div>

        {/* Focus Target */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Target:
              </span>
              <span className="font-bold text-[14px] text-slate-900">{incident.name}</span>
            </div>
            <RiskBadge risk={incident.risk} />
          </div>

          {/* Confidence Meter */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-slate-600">Inference Confidence Score</span>
              <span className="tabular-nums font-bold text-red-600">{incident.confidence}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${incident.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sensory Telemetry Indicators */}
        <div className="mb-4">
          <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Sensory Telemetry Indicators
          </span>
          <div className="space-y-1.5 text-[12px]">
            {/* Surface Temp */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-600" />
                <span className="text-slate-900 font-medium">Ambient Surface Temp</span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-bold text-red-600">{incident.temperature}°C</span>
                <span className="block text-[10px] text-slate-500 tabular-nums">
                  +8°C seasonal baseline
                </span>
              </div>
            </div>

            {/* Fuel Moisture */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-slate-500" />
                <span className="text-slate-900 font-medium">Fuel Moisture / RH</span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-bold text-slate-900">{incident.humidity}%</span>
                <span className="block text-[10px] text-red-600 font-semibold">
                  Severe desiccation
                </span>
              </div>
            </div>

            {/* Wind Vector */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-slate-500" />
                <span className="text-slate-900 font-medium">Sustained Wind Vector</span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-bold text-slate-900">{incident.wind}</span>
                <span className="block text-[10px] text-slate-500">
                  Gusts up to {incident.windGust}
                </span>
              </div>
            </div>

            {/* Thermal Anomaly */}
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-700" />
                <span className="text-slate-900 font-medium">Thermal Anomaly Spike</span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-bold text-amber-800">
                  {incident.thermalAnomaly}
                </span>
                <span className="block text-[10px] text-slate-500">{incident.spectralBand}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Summary */}
        <div className="p-3 bg-slate-100 border border-slate-200 rounded mb-4">
          <div className="flex items-center gap-1.5 mb-1 text-slate-900">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-bold text-[11px] uppercase tracking-wide">Automated Diagnostic</span>
          </div>
          <p className="text-[11.5px] text-slate-600 leading-relaxed">
            {incident.diagnosticText}
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-2 pt-2 bg-slate-50 p-2 rounded border border-slate-200">
        <button
          onClick={handleAcknowledge}
          className={`h-8 px-2 text-[12px] font-semibold rounded transition-colors flex items-center justify-center gap-1 ${
            acknowledged
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
          }`}
          type="button"
        >
          {acknowledged ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Acknowledged</span>
            </>
          ) : (
            <span>Acknowledge Risk</span>
          )}
        </button>

        <button
          onClick={handleDispatch}
          className={`h-8 px-2 text-[12px] font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            dispatched
              ? 'bg-slate-800 text-white'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          type="button"
        >
          {dispatched ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Notice Sent</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Notice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
