import React, { useState, useMemo } from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { GlobalFireRiskMap } from '../components/dashboard/GlobalFireRiskMap';
import { IncidentIntelligence } from '../components/dashboard/IncidentIntelligence';
import { ActiveIncidentAlerts } from '../components/dashboard/ActiveIncidentAlerts';
import { AdminNavbar } from '../components/dashboard/AdminNavbar';

import { mapLocations } from '../data/mapLocations';
import { alerts } from '../data/alerts';

export default function AdminDashboard({ onNavigate }) {
  const [selectedLocationId, setSelectedLocationId] = useState('blr-01');
  const [selectedIncidentData, setSelectedIncidentData] = useState(null);

  // Active selected location for telemetry and dossier
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
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#F1F5F9] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* =========================================================================
          UNIFIED ADMIN HEADER BAR
          ========================================================================= */}
      <AdminNavbar activeNav="DASHBOARD" onNavigate={onNavigate} />

      {/* =========================================================================
          MAIN OPERATIONAL CONTENT (Map on Left, Panels on Right)
          ========================================================================= */}
      <main className="w-full flex-1 p-3.5 bg-[#F1F5F9] flex flex-col min-h-0 overflow-auto lg:overflow-hidden">
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Left: Global Fire Risk Map Viewport (Primary Visual Focus) */}
          <section className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-[520px] lg:min-h-0">
            <GlobalFireRiskMap
              locations={mapLocations}
              selectedId={selectedLocationId}
              onSelectLocation={handleSelectLocation}
              mapHeight="h-full min-h-[480px]"
              className="h-full flex-1 border border-slate-300 rounded-lg shadow-xs"
            />
          </section>

          {/* Right: Operational Intelligence & Alerts Stack */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-3 h-full min-h-0">
            {/* 1. Incident Intelligence Panel (Dark Tactical Theme) */}
            <div className="shrink-0">
              <IncidentIntelligence
                incident={activeIncident}
                variant="tactical"
                onClose={() => setSelectedLocationId(null)}
              />
            </div>

            {/* 2. Active Incident Alerts Feed */}
            <div className="flex-1 min-h-0 flex flex-col">
              <ActiveIncidentAlerts
                alerts={alerts}
                selectedLocationId={selectedLocationId}
                onSelectAlert={handleSelectLocation}
                maxHeight="max-h-full"
                footerText="View all 7 priority emergency alerts →"
                className="border border-slate-300 rounded-lg shadow-xs flex-1"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
