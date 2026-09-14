import React from 'react';

export const MapLegend = ({ resolution = '375m Ground Sample' }) => {
  return (
    <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur px-2.5 py-1.5 border border-slate-200 shadow-sm text-[11px] flex flex-wrap items-center gap-3.5 z-10 rounded">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
        <span className="font-semibold text-[11px] text-slate-800">High Risk (≥80%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block" />
        <span className="font-semibold text-[11px] text-slate-800">Medium (50–79%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block" />
        <span className="font-semibold text-[11px] text-slate-800">Low (&lt;50%)</span>
      </div>
      <span className="text-slate-300 tabular-nums">|</span>
      <span className="tabular-nums text-slate-500 text-[10px]">
        Active Resolution: {resolution}
      </span>
    </div>
  );
};
