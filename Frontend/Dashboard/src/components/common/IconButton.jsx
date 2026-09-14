import React from 'react';

export const IconButton = ({
  icon: Icon,
  label,
  badgeCount,
  onClick,
  active = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${
        active ? 'bg-slate-200 text-slate-900' : ''
      } ${sizeClasses} ${className}`}
      {...props}
    >
      <Icon className="w-4 h-4" />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 bg-red-600 text-white font-bold text-[9px] rounded-full">
          {badgeCount}
        </span>
      )}
    </button>
  );
};
