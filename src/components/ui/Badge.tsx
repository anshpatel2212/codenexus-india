import React from 'react';
import { SeverityLevel, ReviewStatus } from '@/types';
import { AlertCircle, AlertTriangle, Info, Clock, Check } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold tracking-tight rounded-md border ${sizeClasses} ${className}`;

  switch (severity) {
    case 'Critical':
      return (
        <span className={`${base} bg-[#A94842]/10 text-[#A94842] border-[#A94842]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A94842]" aria-hidden="true" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className={`${base} bg-[#B77938]/10 text-[#9A682D] border-[#B77938]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A682D]" aria-hidden="true" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A642B]" aria-hidden="true" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`${base} font-medium bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
          <Info className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
          Low
        </span>
      );
    case 'Needs Human Review':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
          <Clock className="w-3.5 h-3.5 text-[#9A682D]" aria-hidden="true" />
          Human review
        </span>
      );
    default:
      return (
        <span className={`${base} font-medium bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
          {severity}
        </span>
      );
  }
};

interface StatusBadgeProps {
  status: ReviewStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold tracking-tight rounded-md border ${sizeClasses} ${className}`;

  if (status === 'Approved' || status === 'PASSED') {
    return (
      <span className={`${base} bg-[#1F7560]/10 text-[#1F7560] border-[#1F7560]/25`}>
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
        Approved
      </span>
    );
  }

  if (status === 'Changes Requested' || status === 'Needs Revision' || status === 'NEEDS REVIEW') {
    const label = status === 'NEEDS REVIEW' ? 'Needs review' : status;
    return (
      <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#9A682D]" aria-hidden="true" />
        {label}
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className={`${base} bg-[#A94842]/10 text-[#A94842] border-[#A94842]/25`}>
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Rejected
      </span>
    );
  }

  return (
    <span className={`${base} bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
      <Clock className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
      {status}
    </span>
  );
};
