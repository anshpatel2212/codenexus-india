import React from 'react';

interface ScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  let color = 'text-[#A94842] stroke-[#A94842] bg-[#A94842]/10 border-[#A94842]/20';
  let label = 'Substantial Risk';
  if (score >= 90) {
    color = 'text-[#1F7560] stroke-[#1F7560] bg-[#1F7560]/10 border-[#1F7560]/20';
    label = 'Publication Ready';
  } else if (score >= 75) {
    color = 'text-[#416F89] stroke-[#416F89] bg-[#416F89]/10 border-[#416F89]/20';
    label = 'Minor Adjustments';
  } else if (score >= 60) {
    color = 'text-[#9A682D] stroke-[#9A682D] bg-[#F4D77B]/25 border-[#9A682D]/20';
    label = 'Revisions Required';
  }

  const dimensions = {
    sm: { size: 48, strokeWidth: 4, text: 'text-sm font-extrabold', subtext: 'text-xs' },
    md: { size: 76, strokeWidth: 6, text: 'text-xl font-extrabold', subtext: 'text-xs' },
    lg: { size: 104, strokeWidth: 8, text: 'text-3xl font-extrabold', subtext: 'text-xs' },
  }[size];

  const radius = (dimensions.size - dimensions.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Compliance score: ${score} out of 100 (${label})`}
    >
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.size}
          height={dimensions.size}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke="rgba(196,213,224,.75)"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          {/* Score arc */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dimensions.text} font-heading text-[#20364A] tracking-tight`}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-[#4F6576] font-medium -mt-0.5">/100</span>
          )}
        </div>
      </div>

      {showLabel && (
        <span className={`mt-2 font-bold tracking-tight px-2.5 py-0.5 rounded-md border text-xs ${color}`}>
          {label}
        </span>
      )}
    </div>
  );
};
