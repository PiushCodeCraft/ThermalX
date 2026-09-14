import React from 'react';

/**
 * RiskBadge component matching DESIGN.md non-pill rectangular chips
 * @param {'HIGH' | 'MEDIUM' | 'MED' | 'LOW' | 'INFO'} risk
 */
export const RiskBadge = ({ risk, className = '', labelOverride }) => {
  const normalizedRisk = String(risk || 'LOW').toUpperCase();
  const displayLabel = labelOverride || (normalizedRisk === 'MED' ? 'MEDIUM RISK' : `${normalizedRisk} RISK`);

  let badgeStyles = 'bg-surface-subtle text-slate-700 border-slate-300';

  if (normalizedRisk === 'HIGH') {
    badgeStyles = 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]';
  } else if (normalizedRisk === 'MEDIUM' || normalizedRisk === 'MED') {
    badgeStyles = 'bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]';
  } else if (normalizedRisk === 'LOW') {
    badgeStyles = 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]';
  } else if (normalizedRisk === 'INFO') {
    badgeStyles = 'bg-[#EFF6FF] text-[#1E40AF] border-[#93C5FD]';
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 border font-semibold text-[10px] tracking-wider uppercase rounded-sm tabular-nums ${badgeStyles} ${className}`}
    >
      {displayLabel}
    </span>
  );
};