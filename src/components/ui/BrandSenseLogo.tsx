import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  collapsed?: boolean;
  variant?: 'light' | 'dark';
}

export const BrandSenseLogo: React.FC<LogoProps> = ({ 
  className = '', 
  collapsed = false,
  variant = 'dark' 
}) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group transition-transform active:scale-[0.98] ${className}`}>
      {/* Exact BrandSense Logo Mark: Navy container with letter B and warm yellow dot */}
      <div className={`relative w-[35px] h-[35px] rounded-[10px] flex items-center justify-center font-heading font-extrabold text-[19px] shadow-sm overflow-hidden flex-shrink-0 ${
        variant === 'light' ? 'bg-[#416F89] text-white' : 'bg-[#20364A] text-white'
      }`}>
        <span>B</span>
        <div className="absolute top-[3px] right-[3px] w-[11px] h-[11px] rounded-full bg-[#F4D77B]" />
      </div>

      {!collapsed && (
        <span className={`font-heading text-[20px] font-extrabold tracking-[-1px] ${
          variant === 'light' ? 'text-white' : 'text-[#20364A]'
        }`}>
          BrandSense
        </span>
      )}
    </Link>
  );
};
