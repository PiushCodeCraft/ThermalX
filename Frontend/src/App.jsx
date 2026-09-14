import React, { useState, useMemo } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { KPISummary } from './components/dashboard/KPISummary';
import { GlobalFireRiskMap } from './components/dashboard/GlobalFireRiskMap';
import { IncidentIntelligence } from './components/dashboard/IncidentIntelligence';
import { ActiveIncidentAlerts } from './components/dashboard/ActiveIncidentAlerts';
import { SevenDayIncidentTrend } from './components/dashboard/SevenDayIncidentTrend';
import { MonitoredZoneStatus } from './components/dashboard/MonitoredZoneStatus';

import { mapLocations } from './data/mapLocations';
import { alerts } from './data/alerts';
import './styles/global.css';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState('blr-01');
  const [searchQuery, setSearchQuery] = useState('Industrial Zone A, Bengaluru');

  // Filter map locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return mapLocations;
    const query = searchQuery.toLowerCase();
    return mapLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.location.toLowerCase().includes(query) ||
        loc.risk.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Active selected location for Incident Intelligence dossier
  const activeIncident = useMemo(() => {
    return (
      mapLocations.find((loc) => loc.id === selectedLocationId) || mapLocations[0]
    );
  }, [selectedLocationId]);

  const handleQuickSelect = (id, label) => {
    setSelectedLocationId(id);
    setSearchQuery(label);
  };

  const handleSelectLocation = (id) => {
    setSelectedLocationId(id);
    const found = mapLocations.find((loc) => loc.id === id);
    if (found) {
      setSearchQuery(`${found.name}, ${found.location}`);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Top Header & Search Control */}
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickSelect={handleQuickSelect}
      />

      {/* KPI Stats Bar */}
      <KPISummary />

      {/* Main Operational Workspace: GIS Map + ML Incident Intelligence */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left GIS Map Viewport (8 of 12 columns) */}
        <div className="col-span-12 xl:col-span-8">
          <GlobalFireRiskMap
            locations={filteredLocations.length > 0 ? filteredLocations : mapLocations}
            selectedId={selectedLocationId}
            onSelectLocation={handleSelectLocation}
          />
        </div>

        {/* Right Incident Intelligence Panel (4 of 12 columns) */}
        <div className="col-span-12 xl:col-span-4">
          <IncidentIntelligence incident={activeIncident} />
        </div>
      </div>

      {/* Lower Dashboard Section: 3-Column Modular Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Active Alerts */}
        <ActiveIncidentAlerts
          alerts={alerts}
          selectedLocationId={selectedLocationId}
          onSelectAlert={handleSelectLocation}
        />

        {/* Column 2: 7-Day Observation Trend */}
        <SevenDayIncidentTrend />

        {/* Column 3: Monitored Zone Status */}
        <MonitoredZoneStatus />
      </div>
    </DashboardLayout>
  );
}

export default App;