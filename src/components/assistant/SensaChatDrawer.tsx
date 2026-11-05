'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Maximize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { SensaMessage } from '@/types';
import { initialSensaMessages, sensaPromptSuggestions } from '@/data/mock-conversations';
import { SensaMessageBubble } from './SensaMessageBubble';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';

interface SensaChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const createGreeting = (): SensaMessage => ({
  id: `sm-drawer-${Date.now()}`,
  sender: 'sensa',
  timestamp: 'Just now',
  content: `Hello. I'm SENSA, your brand assistant. I can help you check tone, claims, approved facts and brand guidance.

What would you like to review today?`,
});

export const SensaChatDrawer: React.FC<SensaChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<SensaMessage[]>(() =>
    initialSensaMessages.map((message) => ({ ...message }))
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const composer = composerRef.current;
    if (composer) {
      composer.style.height = '0px';
      composer.style.height = `${Math.min(composer.scrollHeight, 108)}px`;
    }
  }, [inputText, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const container = scrollRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isTyping, isOpen, error]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => composerRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(
    () => () => {
      if (responseTimer.current) clearTimeout(responseTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    const userMessage: SensaMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInputText('');
    setError('');
    setIsTyping(true);

    if (responseTimer.current) clearTimeout(responseTimer.current);
    responseTimer.current = setTimeout(async () => {
      try {
        const response = await apiClient.querySensa(text);
        setMessages((previous) => [...previous, response]);
      } catch {
        setError('SENSA could not respond just now. Please try again.');
        toast('SENSA could not respond. Please try again.', 'error');
      } finally {
        setIsTyping(false);
      }
    }, 650);
  };

  const handleCopy = async (id: string, text: string, label = 'Response') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast(`${label} copied`);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast('Could not copy. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    setMessages([createGreeting()]);
    setInputText('');
    setIsTyping(false);
    setError('');
    toast('Started a new conversation');
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[#20364A]/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/10 bg-[#172B3D] shadow-elevated sm:w-[480px]">
        <div className="flex items-center justify-between border-b border-[#31566D] bg-[#20364A] px-4 py-3.5 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#416F89] text-[#F4D77B]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-extrabold tracking-tight">SENSA</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7FD4B8]" />
              </div>
              <p className="text-[10px] text-[#C0D0D9]">Brand assistant · ready</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/assistant"
              onClick={onClose}
              className="rounded-md p-1.5 text-[#C0D0D9] transition-colors hover:bg-white/10 hover:text-white"
              title="Open full assistant"
              aria-label="Open full assistant"
            >
              <Maximize2 className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md p-1.5 text-[#C0D0D9] transition-colors hover:bg-white/10 hover:text-white"
              title="New conversation"
              aria-label="Start a new conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-[#C0D0D9] transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto scroll-smooth px-3 py-4"
        >
          {messages.map((message) => (
            <SensaMessageBubble
              key={message.id}
              message={message}
              compact
              copiedId={copiedId}
              onCopy={handleCopy}
            />
          ))}

          {isTyping && (
            <div className="flex gap-2.5" role="status" aria-label="SENSA is responding">
              <div className="mt-5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#416F89] text-[#F4D77B]">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-md border border-white/10 bg-[#20364A] px-3.5 py-3 shadow-[0_12px_35px_rgba(8,20,30,.18)]">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#9CB0BD]">
                  <span>Checking brand guidance</span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-[#7FA8BF]" />
                    <span
                      className="h-1 w-1 animate-bounce rounded-full bg-[#7FA8BF]"
                      style={{ animationDelay: '120ms' }}
                    />
                    <span
                      className="h-1 w-1 animate-bounce rounded-full bg-[#7FA8BF]"
                      style={{ animationDelay: '240ms' }}
                    />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-3 mt-2 rounded-lg border border-[#C65E57]/30 bg-[#C65E57]/10 px-3 py-2 text-[10px] text-[#F3B6B2]">
            {error}
          </div>
        )}

        <div className="border-t border-white/10 bg-[#172B3D] px-3 py-2.5">
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <Sparkles className="h-3 w-3 text-[#7FA8BF]" />
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#8A9BA7]">
              Try asking
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {sensaPromptSuggestions.slice(0, 3).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isTyping}
                className="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-[#C0D0D9] transition-colors hover:border-[#416F89] hover:bg-[#416F89] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#172B3D] p-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={composerRef}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              aria-label="Ask SENSA a question"
              placeholder="Ask about approved facts, banned terms, or voice..."
              className="max-h-[108px] min-h-[40px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-[#E7EEF3] outline-none transition-colors placeholder:text-[#7F95A3] focus:border-[#7FA8BF] focus:bg-white/10 focus:ring-2 focus:ring-[#7FA8BF]/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#416F89] text-white transition-all hover:bg-[#315C74] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between gap-3 px-1 text-[9px] text-[#7F95A3]">
            <span>Enter to send · Shift + Enter for a new line</span>
            <span>Human review required</span>
          </div>
        </div>
      </div>
    </>
  );
};
