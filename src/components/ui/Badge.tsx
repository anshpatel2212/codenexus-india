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
<<<<<<< HEAD
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded border ${sizeClasses} ${className}`;
=======
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold tracking-tight rounded-md border ${sizeClasses} ${className}`;
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

  switch (severity) {
    case 'Critical':
      return (
<<<<<<< HEAD
        <span className={`${base} bg-[#C65E57]/10 text-[#B24943] border-[#C65E57]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C65E57]" />
=======
        <span className={`${base} bg-[#A94842]/10 text-[#A94842] border-[#A94842]/30`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A94842]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          Critical
        </span>
      );
    case 'High':
      return (
        <span className={`${base} bg-[#B77938]/10 text-[#9A682D] border-[#B77938]/30`}>
<<<<<<< HEAD
          <span className="w-1.5 h-1.5 rounded-full bg-[#B77938]" />
=======
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A682D]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/20`}>
<<<<<<< HEAD
          <span className="w-1.5 h-1.5 rounded-full bg-[#B77938]" />
=======
          <span className="w-1.5 h-1.5 rounded-full bg-[#8A642B]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          Medium
        </span>
      );
    case 'Low':
      return (
<<<<<<< HEAD
        <span className={`${base} font-medium bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
          <Info className="w-3 h-3 text-[#416F89]" />
=======
        <span className={`${base} font-medium bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
          <Info className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          Low
        </span>
      );
    case 'Needs Human Review':
      return (
        <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
<<<<<<< HEAD
          <Clock className="w-3 h-3 text-[#B77938]" />
=======
          <Clock className="w-3.5 h-3.5 text-[#9A682D]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          Human review
        </span>
      );
    default:
      return (
<<<<<<< HEAD
        <span className={`${base} font-medium bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
=======
        <span className={`${base} font-medium bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded border ${sizeClasses} ${className}`;

  if (status === 'Approved' || status === 'PASSED') {
    return (
      <span className={`${base} bg-[#258A70]/10 text-[#1F7560] border-[#258A70]/25`}>
        <Check className="w-3 h-3" />
=======
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const base = `inline-flex items-center gap-1.5 font-bold tracking-tight rounded-md border ${sizeClasses} ${className}`;

  if (status === 'Approved' || status === 'PASSED') {
    return (
      <span className={`${base} bg-[#1F7560]/10 text-[#1F7560] border-[#1F7560]/25`}>
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        Approved
      </span>
    );
  }

  if (status === 'Changes Requested' || status === 'Needs Revision' || status === 'NEEDS REVIEW') {
<<<<<<< HEAD
    return (
      <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
        <AlertTriangle className="w-3 h-3 text-[#B77938]" />
        {status}
=======
    const label = status === 'NEEDS REVIEW' ? 'Needs review' : status;
    return (
      <span className={`${base} bg-[#F4D77B]/25 text-[#8A642B] border-[#B77938]/25`}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#9A682D]" aria-hidden="true" />
        {label}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
      </span>
    );
  }

  if (status === 'Rejected') {
    return (
<<<<<<< HEAD
      <span className={`${base} bg-[#C65E57]/10 text-[#B24943] border-[#C65E57]/25`}>
        <AlertCircle className="w-3 h-3" />
=======
      <span className={`${base} bg-[#A94842]/10 text-[#A94842] border-[#A94842]/25`}>
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        Rejected
      </span>
    );
  }

  return (
<<<<<<< HEAD
    <span className={`${base} bg-[#D5E3EC]/60 text-[#31566D] border-[#C4D5E0]`}>
      <Clock className="w-3 h-3 text-[#416F89]" />
=======
    <span className={`${base} bg-[#D5E3EC]/70 text-[#20364A] border-[#C4D5E0]`}>
      <Clock className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
      {status}
    </span>
  );
};
