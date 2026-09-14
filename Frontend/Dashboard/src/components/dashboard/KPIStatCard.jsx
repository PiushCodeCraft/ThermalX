import React from 'react';

export const KPIStatCard = ({ title, value, icon: Icon, changeText, changeStyle, subtext, iconColor = 'text-slate-500' }) => {
  return (
    <div className="bg-white p-4 shadow-sm rounded border border-slate-200">
      <div className="flex items-center justify-between text-slate-500">
        <span className="font-semibold text-[11px] uppercase tracking-wider">{title}</span>
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
      </div>
      <div className="flex items-baseline gap-2 mt-1.5">
        <span className="tabular-nums text-2xl font-bold text-slate-900">{value}</span>
        {changeText && (
          <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${changeStyle}`}>
            {changeText}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-1">{subtext}</p>
    </div>
  );
};
