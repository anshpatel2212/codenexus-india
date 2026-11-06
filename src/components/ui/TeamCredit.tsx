import React from 'react';
import { Heart } from 'lucide-react';

interface TeamCreditProps {
  className?: string;
  variant?: 'default' | 'light' | 'subtle';
  align?: 'center' | 'left';
  showMembers?: boolean;
}

export const TeamCredit: React.FC<TeamCreditProps> = ({
  className = '',
  variant = 'default',
  align = 'center',
  showMembers = true,
}) => {
  const isLight = variant === 'light';
  const isSubtle = variant === 'subtle';
  const isLeft = align === 'left';

  const containerText = isLight
    ? 'text-white/70'
    : isSubtle
      ? 'text-[#81909C]'
      : 'text-[#718494]';

  const brandText = isLight
    ? 'text-white font-semibold'
    : isSubtle
      ? 'text-[#4F6576] font-semibold'
      : 'text-[#20364A] font-semibold';

  const memberText = isLight
    ? 'text-white/80'
    : isSubtle
      ? 'text-[#4F6576]'
      : 'text-[#31566D]';

  const dotColor = isLight ? 'text-white/40' : 'text-[#C4D5E0]';

  return (
    <div
      role="contentinfo"
      aria-label="BrandSense Team Credit"
      className={`${isLeft ? 'text-left' : 'text-center'} font-sans select-none ${className}`}
    >
      <div className={`inline-flex flex-col sm:flex-row ${isLeft ? 'items-start sm:items-center justify-start' : 'items-center justify-center'} gap-x-2 gap-y-1 text-xs tracking-tight ${containerText}`}>
        {/* Lead credit */}
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span>Made with</span>
          <Heart
            className="w-3.5 h-3.5 text-[#E05252] fill-[#E05252] flex-shrink-0"
            aria-hidden="true"
          />
          <span>by</span>
          <span className={brandText}>Team Timepass</span>
        </span>

        {showMembers && (
          <>
            <span className={`hidden sm:inline ${dotColor}`} aria-hidden="true">•</span>

            {/* Team members */}
            <span className={`inline-flex flex-wrap items-center ${isLeft ? 'justify-start' : 'justify-center'} gap-x-1.5 font-medium ${memberText}`}>
              <span>Ansh Patel</span>
              <span className={dotColor} aria-hidden="true">·</span>
              <span>Prince Patel</span>
              <span className={dotColor} aria-hidden="true">·</span>
              <span>Smit Patel</span>
              <span className={dotColor} aria-hidden="true">·</span>
              <span>Dwij Patel</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
