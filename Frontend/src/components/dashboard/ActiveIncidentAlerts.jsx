import React from 'react';
import { BellRing, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

export const ActiveIncidentAlerts = ({
  alerts = [],
  selectedLocationId,
  onSelectAlert,
  className = '',
  maxHeight = 'max-h-[290px]',
  footerText
}) => {
  return (
    <div className={`bg-white border border-slate-200 shadow-sm p-4 rounded flex flex-col justify-between h-full ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-red-600" />
            <h3 className="font-semibold text-[14px] text-slate-900">Active Incident Alerts</h3>
          </div>
          <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded uppercase">
            {alerts.length} ACTIVE
          </span>
        </div>

        {/* Alerts Feed List */}
        <div className={`space-y-2 ${maxHeight} overflow-y-auto pr-1`}>
          {alerts.map((item) => {
            const isSelected = item.locationId === selectedLocationId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectAlert && onSelectAlert(item.locationId)}
                className={`p-2.5 rounded border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge risk={item.severity} />
                    <span className="font-semibold text-[12px] text-slate-900">
                      {item.sector}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{item.summary}</p>
                </div>
                <span className="tabular-nums text-[10px] text-slate-400 whitespace-nowrap mt-0.5 font-medium">
                  {item.timeAgo}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Link */}
      <a
        href="#alerts"
        className="mt-3 pt-2 text-[#1E3A8A] text-[12px] font-semibold hover:underline flex items-center justify-between border-t border-slate-100"
      >
        <span>{footerText || `View all ${alerts.length} alerts in incident database`}</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
};
