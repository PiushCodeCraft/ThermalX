import React from 'react';

export const SectionHeader = ({
  title,
  icon: Icon,
  iconClassName = 'text-slate-600',
  badge,
  badgeClassName = 'bg-slate-100 text-slate-700',
  subtext,
  children
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 bg-slate-50 p-2 rounded-sm border border-slate-200/60">
      <div>
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={`w-4 h-4 ${iconClassName}`} />}
          <h3 className="font-semibold text-[14px] text-slate-900 leading-tight">{title}</h3>
          {badge && (
            <span className={`px-1.5 py-0.2 font-semibold text-[10px] uppercase rounded-sm ${badgeClassName}`}>
              {badge}
            </span>
          )}
        </div>
        {subtext && <p className="text-[11px] text-slate-500 mt-0.5">{subtext}</p>}
      </div>
      {children && <div className="flex items-center gap-1.5">{children}</div>}
    </div>
  );
};