'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SensaMessageBubble } from '@/components/assistant/SensaMessageBubble';
import { SensaMessage } from '@/types';
import {
  sensaPromptSuggestions,
  SensaThread,
} from '@/data/mock-conversations';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  AlertCircle,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

const createGreeting = (userName?: string): SensaMessage => ({
  id: `sm-${Date.now()}`,
  sender: 'sensa',
  timestamp: 'Just now',
  content: `Hello${userName ? ` ${userName.split(' ')[0]}` : ''}. I'm SENSA, your BrandSense AI copilot.

I can help verify claims, check tone, ensure terminology compliance, and retrieve approved brand facts from your knowledge base.

What would you like to review or verify today?`,
});

export default function AssistantPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [threads, setThreads] = useState<SensaThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SensaMessage[]>([createGreeting(user?.name)]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load threads on mount / user change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `brandsense_sensa_threads_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setThreads(parsed);
          return;
        }
      } catch {
        // Ignore JSON error
      }
    }
    // New account: clean empty list, no demo conversations!
    setThreads([]);
  }, [userId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isTyping, error]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;

    composer.style.height = '0px';
    composer.style.height = `${Math.min(composer.scrollHeight, 120)}px`;
  }, [inputText]);

  useEffect(
    () => () => {
      if (responseTimer.current) clearTimeout(responseTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  const focusComposer = () => {
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  const handleNewConversation = () => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    setMessages([createGreeting(user?.name)]);
    setActiveThreadId(null);
    setInputText('');
    setIsTyping(false);
    setError('');
    focusComposer();
  };

  const handleOpenThread = (thread: SensaThread) => {
    if (responseTimer.current) clearTimeout(responseTimer.current);
    setMessages(thread.messages.map((message) => ({ ...message })));
    setActiveThreadId(thread.id);
    setInputText('');
    setIsTyping(false);
    setError('');
    focusComposer();
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    const updated = threads.filter((t) => t.id !== threadId);
    setThreads(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`brandsense_sensa_threads_${userId}`, JSON.stringify(updated));
    }
    if (activeThreadId === threadId) {
      handleNewConversation();
    }
    toast('Conversation deleted.');
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

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    const userMessage: SensaMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      content: text,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setError('');
    setIsTyping(true);

    let currentThreadId = activeThreadId;
    let currentThreads = [...threads];

    if (!currentThreadId) {
      // Auto-create new thread like ChatGPT/Gemini
      currentThreadId = `thread-${Date.now()}`;
      const title = text.length > 30 ? `${text.substring(0, 28)}…` : text;
      const newThread: SensaThread = {
        id: currentThreadId,
        title,
        preview: text,
        date: 'Just now',
        messages: nextMessages,
      };
      currentThreads = [newThread, ...currentThreads];
      setActiveThreadId(currentThreadId);
      setThreads(currentThreads);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`brandsense_sensa_threads_${userId}`, JSON.stringify(currentThreads));
      }
    } else {
      // Update active thread
      const idx = currentThreads.findIndex((t) => t.id === currentThreadId);
      if (idx >= 0) {
        currentThreads[idx] = {
          ...currentThreads[idx],
          preview: text,
          date: 'Just now',
          messages: nextMessages,
        };
        setThreads([...currentThreads]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`brandsense_sensa_threads_${userId}`, JSON.stringify(currentThreads));
        }
      }
    }

    (async () => {
      try {
        const history = nextMessages.map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          content: m.content,
        }));
        const response = await apiClient.querySensa(text, history);
        const finalMessages = [...nextMessages, response];
        setMessages(finalMessages);

        // Update thread with AI response
        const tIdx = currentThreads.findIndex((t) => t.id === currentThreadId);
        if (tIdx >= 0) {
          currentThreads[tIdx] = {
            ...currentThreads[tIdx],
            messages: finalMessages,
          };
          setThreads([...currentThreads]);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`brandsense_sensa_threads_${userId}`, JSON.stringify(currentThreads));
          }
        }
      } catch {
        setError('SENSA could not respond just now. Please try again.');
        toast('SENSA could not respond. Please try again.', 'error');
      } finally {
        setIsTyping(false);
      }
    })();
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100dvh-120px)] min-h-[520px] flex-col gap-4 font-sans lg:h-[calc(100vh-140px)] lg:min-h-[600px] lg:flex-row lg:gap-5">
        {/* Left Chat Sidebar (ChatGPT / Gemini style) */}
        <aside
          aria-label="Conversation history"
          className="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_15px_45px_rgba(32,54,74,.07)] backdrop-blur-[18px] lg:w-[300px]"
        >
          <div className="border-b border-[#E1EAF0] p-3 lg:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 lg:h-10 lg:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#20364A] text-[#F4D77B] shadow-sm" aria-hidden="true">
                  <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-heading text-sm lg:text-base font-extrabold tracking-tight text-[#20364A]">
                    SENSA Copilot
                  </h1>
                  <p className="text-[11px] lg:text-xs font-medium text-[#4F6576]">Brand Intelligence</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNewConversation}
                className="flex h-8 w-8 lg:h-9 lg:w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#D9E5EC] bg-white text-[#4F6576] transition-colors hover:border-[#416F89] hover:text-[#315C74] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                aria-label="Start a new conversation"
                title="New chat"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewConversation}
              className="mt-2 lg:mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#416F89]/30 bg-[#416F89]/10 px-3 py-1.5 lg:py-2 text-xs font-bold text-[#315C74] transition-all hover:bg-[#416F89]/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ New Chat</span>
            </button>
          </div>

          <div className="hidden flex-1 overflow-y-auto p-3 lg:block">
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F6576]">
                Saved Chats
              </span>
              <span className="text-xs font-semibold text-[#4F6576]">{threads.length}</span>
            </div>

            {threads.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#4F6576]">
                <MessageSquare className="w-7 h-7 text-[#416F89]/40 mx-auto mb-2" aria-hidden="true" />
                <p className="font-bold text-[#20364A]">No Saved Chats</p>
                <p className="text-[11px] mt-1 text-[#4F6576] leading-relaxed">
                  Every conversation with SENSA will be automatically saved here.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {threads.map((thread) => {
                  const isActive = activeThreadId === thread.id;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => handleOpenThread(thread)}
                      className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                        isActive
                          ? 'border-[#416F89]/40 bg-[#EDF3F6]'
                          : 'border-transparent hover:border-[#E1EAF0] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <MessageSquare
                          className={`h-4 w-4 flex-shrink-0 ${
                            isActive ? 'text-[#416F89]' : 'text-[#4F6576]'
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span className="truncate block text-xs font-bold leading-snug text-[#20364A]">
                            {thread.title}
                          </span>
                          <span className="text-[10px] text-[#4F6576] block truncate">
                            {thread.messages.length} messages
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#A94842]/15 text-[#4F6576] hover:text-[#A94842] transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden lg:block mt-auto border-t border-[#E1EAF0] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#20364A]">
              <span className="h-2 w-2 rounded-full bg-[#1F7560]" aria-hidden="true" />
              <span>Grounded Knowledge Base</span>
            </div>
            <p className="mt-1 text-xs text-[#4F6576] truncate">
              {user?.organisation || 'BrandSense Workspace'} • Active
            </p>
          </div>
        </aside>

        {/* Chat Workspace */}
        <section
          aria-label="Chat workspace"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#172B3D] shadow-[0_20px_60px_rgba(8,20,30,.24)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#172B3D]/95 px-4 py-3 backdrop-blur sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#416F89] text-[#F4D77B]" aria-hidden="true">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-sm font-extrabold text-[#E7EEF3]">SENSA</h2>
                <p className="flex items-center gap-1.5 text-xs text-[#B9CDDC]">
                  <span className="h-2 w-2 rounded-full bg-[#7FD4B8]" aria-hidden="true" />
                  Ready • Grounded in brand governance guidelines
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewConversation}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#D5E3EC] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FA8BF]"
              aria-label="Start a new conversation"
              title="New chat"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-6 overflow-y-auto scroll-smooth bg-gradient-to-b from-[#172B3D] via-[#1B3346] to-[#20364A] px-3 py-5 sm:px-5"
            aria-live="polite"
          >
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <SensaMessageBubble
                  key={message.id}
                  message={message}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              ))}

              {isTyping && (
                <div className="flex gap-2.5 sm:gap-3" role="status" aria-label="SENSA is responding">
                  <div className="mt-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#416F89] text-[#F4D77B]" aria-hidden="true">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-white/10 bg-[#20364A] px-4 py-3 shadow-[0_12px_35px_rgba(8,20,30,.18)]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#D5E3EC]">
                      <span>Checking brand guidance</span>
                      <span className="flex items-center gap-0.5" aria-hidden="true">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7FA8BF]" />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7FA8BF]"
                          style={{ animationDelay: '120ms' }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7FA8BF]"
                          style={{ animationDelay: '240ms' }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-[#A94842]/40 bg-[#A94842]/15 px-3 py-2 text-xs text-[#F3B6B2] sm:mx-5" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="border-t border-white/10 bg-[#172B3D] px-3 py-3 sm:px-4">
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <Sparkles className="h-3.5 w-3.5 text-[#8FB3C6]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#B9CDDC]">
                Suggested Prompts
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sensaPromptSuggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  disabled={isTyping}
                  className="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#D5E3EC] transition-colors hover:border-[#416F89] hover:bg-[#416F89] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FB3C6]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#172B3D] p-3 sm:p-4">
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
                placeholder="Ask about brand voice, claims or approved facts..."
                aria-label="Ask SENSA a question"
                className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm text-[#E7EEF3] outline-none transition-colors placeholder:text-[#8FA7B8] focus:border-[#7FA8BF] focus:bg-white/10 focus:ring-2 focus:ring-[#7FA8BF]/25"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl bg-[#416F89] text-white transition-all hover:bg-[#315C74] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FA8BF]"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-[#B9CDDC]">
              <span>Enter to send • Shift + Enter for a new line</span>
              <span className="hidden sm:inline">AI suggestions • Grounded verification</span>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
