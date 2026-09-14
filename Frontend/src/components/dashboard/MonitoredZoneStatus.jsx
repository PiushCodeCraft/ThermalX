import React from 'react';
import { PieChart } from 'lucide-react';
import { monitoredZonesSummary } from '../../data/monitoredZones';

export const MonitoredZoneStatus = () => {
  const {
    totalSectors,
    highRiskCount,
    highRiskPercent,
    medRiskCount,
    medRiskPercent,
    lowRiskCount,
    lowRiskPercent,
    geoExposure,
    auditRef,
    compliance
  } = monitoredZonesSummary;

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 rounded flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-[14px] text-slate-900">Monitored Zone Status</h3>
          </div>
          <span className="tabular-nums text-[11px] text-slate-500 font-medium">
            {totalSectors} Sectors
          </span>
        </div>

        {/* Segmented Proportion Bars */}
        <div className="space-y-3 mt-2">
          {/* High Risk */}
          <div>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold text-red-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                High Risk Sentry
              </span>
              <span className="tabular-nums font-bold text-slate-900">
                {highRiskCount} zones ({highRiskPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${highRiskPercent}%` }} />
            </div>
          </div>

          {/* Medium Risk */}
          <div>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                Medium Vulnerability
              </span>
              <span className="tabular-nums font-bold text-slate-900">
                {medRiskCount} zones ({medRiskPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-amber-600" style={{ width: `${medRiskPercent}%` }} />
            </div>
          </div>

          {/* Low Risk */}
          <div>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Nominal Baseline
              </span>
              <span className="tabular-nums font-bold text-slate-900">
                {lowRiskCount} zones ({lowRiskPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${lowRiskPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Geographic Exposure Split */}
        <div className="mt-4 pt-3 bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
            Geographic Exposure Split
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="block text-[10px] text-slate-500 font-semibold">APAC</span>
              <span className="tabular-nums font-bold text-[12px] text-slate-900">
                {geoExposure.apacPercent}%
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="block text-[10px] text-slate-500 font-semibold">AMER</span>
              <span className="tabular-nums font-bold text-[12px] text-slate-900">
                {geoExposure.amerPercent}%
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="block text-[10px] text-slate-500 font-semibold">EMEA</span>
              <span className="tabular-nums font-bold text-[12px] text-slate-900">
                {geoExposure.emeaPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ref */}
      <div className="mt-3 text-right pt-2 border-t border-slate-100">
        <span className="text-[10px] text-slate-400 font-medium tabular-nums">
          Audit Ref: {auditRef} • {compliance}
        </span>
      </div>
    </div>
  );
};
