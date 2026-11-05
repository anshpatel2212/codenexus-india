'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  FileCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { SensaMessage } from '@/types';
import { SeverityBadge } from '@/components/ui/Badge';
import { SensaRichText } from './SensaRichText';

interface SensaMessageBubbleProps {
  message: SensaMessage;
  compact?: boolean;
  copiedId: string | null;
  onCopy: (id: string, text: string, label?: string) => void;
}

export const SensaMessageBubble: React.FC<SensaMessageBubbleProps> = ({
  message,
  compact = false,
  copiedId,
  onCopy,
}) => {
  const isUser = message.sender === 'user';
  const avatarSize = compact ? 'w-7 h-7' : 'w-8 h-8';
  const padding = compact ? 'p-3.5' : 'p-4 sm:p-5';

  return (
    <div className={`flex gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`${avatarSize} mt-5 flex flex-shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'border border-white/10 bg-white/5 text-[#9CB0BD]'
            : 'bg-[#416F89] text-[#F4D77B]'
        }`}
        aria-hidden="true"
      >
        {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 ${isUser ? 'max-w-[88%] sm:max-w-[78%]' : 'max-w-[92%] sm:max-w-[86%]'}`}>
        <div className={`mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-semibold text-[#8A9BA7] ${isUser ? 'justify-end' : ''}`}>
          <span>{isUser ? 'You' : 'SENSA'}</span>
          <span aria-hidden="true">·</span>
          <span>{message.timestamp}</span>
        </div>

        <div
          className={`${padding} rounded-2xl border text-xs leading-relaxed shadow-[0_12px_35px_rgba(8,20,30,.18)] ${
            isUser
              ? 'rounded-tr-md border-[#5A8AA4] bg-[#416F89] text-white'
              : 'rounded-tl-md border-white/10 bg-[#20364A] text-[#D5E3EC]'
          }`}
        >
          {!isUser && (message.severity || message.confidence) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              {message.severity && <SeverityBadge severity={message.severity} size="sm" />}
              {message.confidence && (
                <span className="text-[10px] font-bold text-[#9CB0BD]">
                  {message.confidence}% match
                </span>
              )}
              {message.requiresHumanReview && (
                <span className="text-[10px] font-semibold text-[#F4D77B]">
                  Human review required
                </span>
              )}
            </div>
          )}

          <SensaRichText text={message.content} />

          {message.suggestedFix && (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#172B3D] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#E7EEF3]">
                  <FileCheck className="h-3.5 w-3.5 text-[#7FA8BF]" />
                  Suggested wording
                </span>
                <button
                  type="button"
                  onClick={() => onCopy(`${message.id}-fix`, message.suggestedFix!, 'Suggested wording')}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#A9C7D8] transition-colors hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-[11px] font-medium italic leading-relaxed text-[#C0D0D9] sm:text-xs">
                {message.suggestedFix}
              </p>
              <Link
                href="/review/rewrite"
                className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#A9C7D8] transition-colors hover:text-white"
              >
                Open in Rewrite Studio
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#8A9BA7]">
                <BookOpen className="h-3 w-3" />
                Sources
              </span>
              <div className={`grid gap-1.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
                {message.citations.map((citation, index) => (
                  <div
                    key={`${citation.title}-${index}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[10px] font-bold text-[#E7EEF3]">
                        {citation.title}
                      </p>
                      <span className="flex-shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-[#D5E3EC]">
                        {citation.confidence}%
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[9px] text-[#8A9BA7]">
                      {citation.section}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isUser && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
              <button
                type="button"
                onClick={() => onCopy(message.id, message.content, 'Response')}
                className="flex items-center gap-1 text-[10px] font-bold text-[#9CB0BD] transition-colors hover:text-white"
              >
                {copiedId === message.id ? (
                  <>
                    <Check className="h-3 w-3 text-[#7FD4B8]" />
                    <span className="text-[#7FD4B8]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy response</span>
                  </>
                )}
              </button>
              <span className="text-[9px] text-[#7F95A3]">Grounded in brand guidance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
