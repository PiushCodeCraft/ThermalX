import React, { useState, useMemo } from 'react';
import { KPISummary } from '../components/dashboard/KPISummary';
import { IncidentIntelligence } from '../components/dashboard/IncidentIntelligence';
import { ThreeDayIncidentTrend } from '../components/dashboard/ThreeDayIncidentTrend';
import { NearAreaMonitoring } from '../components/dashboard/NearAreaMonitoring';
import { AdminNavbar } from '../components/dashboard/AdminNavbar';

import { mapLocations } from '../data/mapLocations';

export default function AdminReport({ onNavigate }) {
  const [selectedLocationId, setSelectedLocationId] = useState('blr-01');

  const activeIncident = useMemo(() => {
    return mapLocations.find((loc) => loc.id === selectedLocationId) || mapLocations[0];
  }, [selectedLocationId]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* =========================================================================
          UNIFIED ADMIN HEADER BAR
          ========================================================================= */}
      <AdminNavbar activeNav="REPORT" onNavigate={onNavigate} />

      {/* =========================================================================
          MAIN REPORT PAGE BODY
          ========================================================================= */}
      <main className="w-full flex-1 p-3.5 bg-[#F1F5F9]">
        <div className="grid grid-cols-12 gap-3">
          {/* Left Column: Incident Intelligence + 3-Day Incident Trend */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-3">
            {/* 1. Incident Intelligence Section */}
            <div>
              <IncidentIntelligence
                incident={activeIncident}
                variant="standard"
              />
            </div>

            {/* 2. 3-Day Incident Trend Section */}
            <div>
              <ThreeDayIncidentTrend />
            </div>
          </section>

          {/* Right Column: 2x2 KPI Cards + Near Area Surveillance */}
          <section className="col-span-12 lg:col-span-6 flex flex-col gap-3">
            {/* 1. 2x2 KPI Cards (Total Incidents, High-Risk Sectors, Active Action Alerts, Monitored Sectors) */}
            <KPISummary gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-3" />

            {/* 2. Near Area Surveillance & Perimeter Monitoring (Bottom/Right Space) */}
            <div className="flex-1">
              <NearAreaMonitoring
                activeTarget={`${activeIncident.name}, ${activeIncident.location}`}
                maxHeight="max-h-[380px]"
                className="h-full"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
