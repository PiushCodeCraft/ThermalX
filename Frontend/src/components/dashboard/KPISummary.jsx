import React from 'react';
import { KPIStatCard } from './KPIStatCard';
import { Flame, AlertTriangle, Radio, Satellite } from 'lucide-react';
import { kpiMetrics } from '../../data/incidents';

export const KPISummary = () => {
  return (
    <section className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPIStatCard
          title={kpiMetrics.totalIncidents.label}
          value={kpiMetrics.totalIncidents.value}
          icon={Flame}
          changeText={kpiMetrics.totalIncidents.change}
          changeStyle="bg-orange-100 text-amber-900 border border-orange-200"
          subtext={kpiMetrics.totalIncidents.subtext}
          iconColor="text-amber-600"
        />

        <KPIStatCard
          title={kpiMetrics.highRiskSectors.label}
          value={kpiMetrics.highRiskSectors.value}
          icon={AlertTriangle}
          changeText={kpiMetrics.highRiskSectors.change}
          changeStyle="bg-red-100 text-red-900 border border-red-200"
          subtext={kpiMetrics.highRiskSectors.subtext}
          iconColor="text-red-600"
        />

        <KPIStatCard
          title={kpiMetrics.activeAlerts.label}
          value={kpiMetrics.activeAlerts.value}
          icon={Radio}
          changeText={kpiMetrics.activeAlerts.change}
          changeStyle="bg-amber-100 text-amber-900 border border-amber-200 font-semibold"
          subtext={kpiMetrics.activeAlerts.subtext}
          iconColor="text-slate-700"
        />

        <KPIStatCard
          title={kpiMetrics.monitoredSectors.label}
          value={kpiMetrics.monitoredSectors.value}
          icon={Satellite}
          changeText={kpiMetrics.monitoredSectors.change}
          changeStyle="bg-blue-50 text-blue-800 border border-blue-200"
          subtext={kpiMetrics.monitoredSectors.subtext}
          iconColor="text-blue-600"
        />
      </div>
    </section>
  );
};
