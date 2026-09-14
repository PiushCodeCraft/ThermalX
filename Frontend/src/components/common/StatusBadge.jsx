import React from 'react';

export const StatusBadge = ({ status = 'Operational', pulse = false }) => {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-subtle border border-border-interactive rounded text-[11px] font-semibold text-text-primary uppercase tracking-wider">
      <span className={`w-2 h-2 rounded-full bg-blue-600 ${pulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </div>
  );
};
