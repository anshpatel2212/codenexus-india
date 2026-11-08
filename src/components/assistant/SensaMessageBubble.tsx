'use client';

import React from 'react';
import {
  Check,
  Copy,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { SensaMessage } from '@/types';
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
            ? 'border border-white/10 bg-white/5 text-[#B9CDDC]'
            : 'bg-[#416F89] text-[#F4D77B]'
        }`}
        aria-hidden="true"
      >
        {isUser ? <UserRound className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 ${isUser ? 'max-w-[88%] sm:max-w-[78%]' : 'max-w-[92%] sm:max-w-[86%]'}`}>
        <div className={`mb-1.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-[#B9CDDC] ${isUser ? 'justify-end' : ''}`}>
          <span>{isUser ? 'You' : 'SENSA'}</span>
          <span aria-hidden="true">·</span>
          <span>{message.timestamp}</span>
        </div>

        <div
          className={`${padding} rounded-2xl border text-xs sm:text-sm leading-relaxed shadow-[0_12px_35px_rgba(8,20,30,.18)] ${
            isUser
              ? 'rounded-tr-md border-[#5A8AA4] bg-[#416F89] text-white'
              : 'rounded-tl-md border-white/10 bg-[#20364A] text-[#D5E3EC]'
          }`}
        >
          <SensaRichText text={message.content} />

          {!isUser && (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
              <button
                type="button"
                onClick={() => onCopy(message.id, message.content, 'Response')}
                className="flex items-center gap-1 text-xs font-bold text-[#B9CDDC] transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FB3C6]"
                aria-label="Copy assistant response"
              >
                {copiedId === message.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#7FD4B8]" aria-hidden="true" />
                    <span className="text-[#7FD4B8]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy response</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
