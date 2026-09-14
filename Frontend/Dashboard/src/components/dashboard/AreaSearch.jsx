import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export const AreaSearch = ({ searchQuery, setSearchQuery, onQuickSelect }) => {
  const quickChips = [
    { label: 'Bengaluru (Sector 4)', id: 'blr-01' },
    { label: 'Australia (NSW East)', id: 'aus-01' },
    { label: 'California Sector 4', id: 'cal-04' },
    { label: 'Mediterranean Basin', id: 'med-01' }
  ];

  return (
    <div className="flex-1 max-w-2xl">
      <div className="relative flex items-center">
        <div className="absolute left-2.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country, region or monitored sector..."
          className="w-full h-8 pl-8 pr-20 bg-slate-100 text-slate-900 border border-slate-200 rounded text-[13px] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1E3A8A] transition-colors"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          <button
            type="button"
            className="h-6 px-1.5 bg-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-300 transition-colors flex items-center gap-1 rounded"
            title="Active Filters: 3"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="tabular-nums font-bold">3</span>
          </button>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto text-[11px]">
        <span className="font-semibold text-[10px] text-slate-500 uppercase tracking-wider">Quick:</span>
        {quickChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onQuickSelect && onQuickSelect(chip.id, chip.label)}
            className="px-2 py-0.5 bg-slate-100 text-[#1E3A8A] border border-slate-200 rounded font-medium hover:bg-[#1E3A8A] hover:text-white transition-colors whitespace-nowrap"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
