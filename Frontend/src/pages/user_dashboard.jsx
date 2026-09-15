import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Clock, MessageSquare, X, CheckCircle2, Send, AlertTriangle } from 'lucide-react';
import { GlobalFireRiskMap } from '../components/dashboard/GlobalFireRiskMap';
import { IncidentIntelligence } from '../components/dashboard/IncidentIntelligence';
import { ActiveIncidentAlerts } from '../components/dashboard/ActiveIncidentAlerts';
import { ExportReport } from '../components/dashboard/ExportReport';

import { mapLocations } from '../data/mapLocations';
import { alerts } from '../data/alerts';

export default function UserDashboard() {
  const [selectedLocationId, setSelectedLocationId] = useState('blr-01');
  const [utcTime, setUtcTime] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'observation',
    incidentId: 'blr-01',
    notes: '',
    confidenceAssessment: 'Accurate'
  });

  // Real-time UTC Clock
  useEffect(() => {
    const updateUtc = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`UTC ${hours}:${minutes}`);
    };
    updateUtc();
    const timer = setInterval(updateUtc, 10000);
    return () => clearInterval(timer);
  }, []);

  const [selectedIncidentData, setSelectedIncidentData] = useState(null);

  // Currently selected active incident
  const activeIncident = useMemo(() => {
    if (selectedIncidentData) return selectedIncidentData;
    return mapLocations.find((loc) => loc.id === selectedLocationId) || mapLocations[0];
  }, [selectedLocationId, selectedIncidentData]);

  const handleSelectLocation = (id, customData = null) => {
    setSelectedLocationId(id);
    if (customData) {
      setSelectedIncidentData(customData);
    } else {
      const found = mapLocations.find((loc) => loc.id === id);
      setSelectedIncidentData(found || null);
    }
    setFeedbackForm((prev) => ({ ...prev, incidentId: id }));
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setIsFeedbackOpen(false);
      setFeedbackForm({
        category: 'observation',
        incidentId: selectedLocationId,
        notes: '',
        confidenceAssessment: 'Accurate'
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* =========================================================================
          TOP OPERATIONAL HEADER BAR (Strictly matching USER DASHBOARD.png)
          ========================================================================= */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 min-h-[70px] flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#00236F] flex items-center justify-center text-white shadow-xs">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xl font-bold uppercase tracking-tight text-slate-950">
            THERMALX
          </span>
        </div>

        {/* Center: System Status & Live UTC Clock */}
        <div className="flex items-center gap-3">
          {/* Operational Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-[12px]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-xs" />
            <span className="font-bold text-slate-900 tracking-tight">
              SYSTEM STATUS: OPERATIONAL
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">Sat-Feed Active</span>
          </div>

          {/* Live UTC Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-[12px] font-mono font-bold text-slate-800 tabular-nums shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{utcTime || 'UTC 06:55'}</span>
          </div>
        </div>

        {/* Right: Export & Feedback Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Export Dropdown */}
          <ExportReport label="EXPORT" variant="outline" />

          {/* Feedback Trigger Button */}
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded font-semibold text-[13px] tracking-normal transition-colors shadow-xs flex items-center gap-1.5 focus:outline-none"
            type="button"
          >
            <span>FEEDBACK</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN OPERATIONAL BODY (Map on Left, Incidents on Right)
          ========================================================================= */}
      <main className="w-full flex-1 p-3.5 bg-[#F1F5F9]">
        <div className="grid grid-cols-12 gap-3 h-full">
          {/* Left: Global Fire Risk Map Viewport (Primary Visual Focus) */}
          <section className="col-span-12 lg:col-span-8 flex flex-col">
            <GlobalFireRiskMap
              locations={mapLocations}
              selectedId={selectedLocationId}
              onSelectLocation={handleSelectLocation}
              mapHeight="h-[620px]"
              className="h-full border border-slate-300 rounded-lg shadow-xs"
            />
          </section>

          {/* Right: Operational Panels Stack */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-3">
            {/* 1. Incident Intelligence Panel (Dark Tactical Theme) */}
            <IncidentIntelligence
              incident={activeIncident}
              variant="tactical"
              onClose={() => setSelectedLocationId(null)}
            />

            {/* 2. Active Incident Alerts Feed */}
            <ActiveIncidentAlerts
              alerts={alerts}
              selectedLocationId={selectedLocationId}
              onSelectAlert={handleSelectLocation}
              maxHeight="max-h-[280px]"
              footerText="View all 7 alerts in incident database →"
              className="border border-slate-300 rounded-lg shadow-xs flex-1"
            />
          </section>
        </div>
      </main>

      {/* =========================================================================
          EMERGENCY OPERATOR FEEDBACK MODAL DIALOG
          ========================================================================= */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-slate-900 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-[14px] uppercase tracking-wide">
                  Operator System Feedback
                </h3>
              </div>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            {feedbackSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-900 text-base">Feedback Recorded</h4>
                <p className="text-xs text-slate-600">
                  Observation telemetry dispatched to ThermalX Incident Operations log.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="p-4 space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Related Sector Target
                  </label>
                  <select
                    value={feedbackForm.incidentId}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, incidentId: e.target.value })
                    }
                    className="w-full text-xs font-medium border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-blue-600"
                  >
                    {mapLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.location} ({loc.risk})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Observation Category
                  </label>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, category: e.target.value })
                    }
                    className="w-full text-xs font-medium border border-slate-300 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-blue-600"
                  >
                    <option value="observation">Field Verification & Ground Truth</option>
                    <option value="false_positive">Thermal Hotspot False Positive</option>
                    <option value="sensor_drift">Satellite Radiometer Calibration Anomaly</option>
                    <option value="escalation">Urgent Flame Spread Acceleration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Telemetry Assessment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Accurate', 'Underestimated', 'Overestimated'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setFeedbackForm({ ...feedbackForm, confidenceAssessment: opt })
                        }
                        className={`py-1 text-[11px] font-semibold border rounded transition-colors ${
                          feedbackForm.confidenceAssessment === opt
                            ? 'bg-[#00236F] text-white border-[#00236F]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Operational Field Notes
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter observer telemetry notes, ground crew report, or wind vector corrections..."
                    value={feedbackForm.notes}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, notes: e.target.value })
                    }
                    className="w-full text-xs border border-slate-300 rounded p-2 focus:outline-blue-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold uppercase bg-[#00236F] hover:bg-[#1E3A8A] text-white rounded flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
