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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded border ${sizeClasses} ${className}`;

  switch (severity) {
    case 'Critical':
      return (
        <span className={`${base} bg-[#C65E57]/10 text-[#B24943] border-[#C65E57]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C65E57]" />
          Critical
        </span>
      );
    case 'High':
      return (
        <span className={`${base} bg-[#B77938]/10 text-[#9A682D] border-[#B77938]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B77938]" />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/20`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B77938]" />
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className={`${base} font-medium bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
          <Info className="w-3 h-3 text-[#416F89]" />
          Low
        </span>
      );
    case 'Needs Human Review':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
          <Clock className="w-3 h-3 text-[#B77938]" />
          Human review
        </span>
      );
    default:
      return (
        <span className={`${base} font-medium bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded border ${sizeClasses} ${className}`;

  if (status === 'Approved' || status === 'PASSED') {
    return (
      <span className={`${base} bg-[#258A70]/10 text-[#1F7560] border-[#258A70]/25`}>
        <Check className="w-3 h-3" />
        Approved
      </span>
    );
  }

  if (status === 'Changes Requested' || status === 'Needs Revision' || status === 'NEEDS REVIEW') {
    return (
      <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
        <AlertTriangle className="w-3 h-3 text-[#B77938]" />
        {status}
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
      <span className={`${base} bg-[#C65E57]/10 text-[#B24943] border-[#C65E57]/25`}>
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
  }

  return (
    <span className={`${base} bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
      <Clock className="w-3 h-3 text-[#416F89]" />
      {status}
    </span>
  );
};
