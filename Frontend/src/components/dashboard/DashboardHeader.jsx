import React, { useState, useEffect } from 'react';
import { AreaSearch } from './AreaSearch';
import { ExportReport } from './ExportReport';

export const DashboardHeader = ({ searchQuery, setSearchQuery, onQuickSelect }) => {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white p-4 shadow-sm rounded border border-slate-200 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title & Metadata */}
        <div className="flex flex-col min-w-[280px]">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-xl text-slate-900 tracking-tight">
              Fire Risk Overview
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider bg-slate-100 text-slate-700 border border-slate-200 rounded uppercase">
              STATION LIVE
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Global monitoring of fire-risk conditions and active incidents. Last updated 2 min ago •{' '}
            <span className="tabular-nums font-medium text-slate-700">MODIS / VIIRS Terra-Aqua</span>
          </p>
        </div>

        {/* Quick Search */}
        <AreaSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onQuickSelect={onQuickSelect}
        />

        {/* Right Actions: Live Refresh Toggle & Export */}
        <div className="flex items-center justify-end gap-2.5">
          {/* Live Feed Badge */}
          <div
            onClick={() => setSeconds(30)}
            className="h-10 flex items-center gap-2.5 px-3.5 bg-[#EFF4FF] border border-[#BFDBFE] rounded text-[12px] cursor-pointer hover:bg-[#E0ECFF] transition-colors select-none shadow-xs"
            title="Click to refresh live feed"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0051D5] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0051D5]" />
            </span>
            <span className="uppercase tracking-wider font-semibold text-[#00236F]">Live Feed</span>
            <span className="tabular-nums font-semibold text-[11px] bg-white text-[#0051D5] px-2 py-0.5 rounded border border-blue-200/80 shadow-2xs">
              {seconds}s
            </span>
          </div>

          <ExportReport />
        </div>
      </div>
    </header>
  );
};
