import React from 'react';

/**
 * Standard Operational Button component following DESIGN.md
 */
export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'destructive' | 'ghost'
  size = 'md',          // 'sm' (28px) | 'md' (32px)
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'h-7 px-2 text-[11px]',
    md: 'h-8 px-3 text-[12px]'
  }[size] || 'h-8 px-3 text-[12px]';

  const variantStyles = {
    primary: 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF] border border-[#1E3A8A]',
    secondary: 'bg-white text-[#0F172A] hover:bg-[#F8FAFC] border border-[#CBD5E1]',
    destructive: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-[#DC2626]',
    ghost: 'bg-transparent text-[#334155] hover:bg-[#F1F5F9] border border-transparent'
  }[variant] || 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-1.5" />}
      {children}
    </button>
  );
};
