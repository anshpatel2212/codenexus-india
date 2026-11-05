'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Undo2, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { sampleReviews } from '@/data/mock-data';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';
import { ReviewItem } from '@/types';

interface ChangeItem {
  id: string;
  original: string;
  replacement: string;
  reason: string;
  category: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function RewriteStudioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [review, setReview] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);

  const initialChanges: ChangeItem[] = [
    {
      id: 'c-1',
      original: 'guarantees a 100% elimination of all regulatory compliance fines within 30 days',
      replacement: 'is designed to help reduce regulatory risk and streamline compliance reviews',
      reason: 'Replaced unapproved absolute performance warranty with qualified risk mitigation statement.',
      category: 'Legal Warranty',
      status: 'pending',
    },
    {
      id: 'c-2',
      original: 'disruptive miracle platform',
      replacement: 'enterprise content governance platform',
      reason: 'Eliminated blacklisted hyperbole ("miracle", "disruptive") with professional B2B nomenclature.',
      category: 'Banned Buzzwords',
      status: 'pending',
    },
    {
      id: 'c-3',
      original: 'brand sense Cloud Sync',
      replacement: 'BrandSense Content Hub™',
      reason: 'Enforced official CamelCase trademark and registered module name.',
      category: 'Trademark Integrity',
      status: 'accepted',
    },
    {
      id: 'c-4',
      original: 'instant 450% ROI on their enterprise license in quarter one',
      replacement: 'measurable workflow acceleration (*Results based on a 2025 cohort study of 42 enterprise accounts; individual outcomes vary)',
      reason: 'Appended mandatory FTC financial disclaimer and verified study footnote.',
      category: 'Disclaimer Compliance',
      status: 'pending',
    },
    {
      id: 'c-5',
      original: 'Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!',
      replacement: 'Equip your marketing and compliance teams with proactive governance today.',
      reason: 'Restored respectful, authoritative brand voice; eliminated aggressive fear-tactics.',
      category: 'Brand Voice',
      status: 'pending',
    },
    {
      id: 'c-6',
      original: 'Click the green button on the right side of the screen',
      replacement: 'Select the ‘Download Report’ button below',
      reason: 'Converted visual-only directional cue to accessible action text per WCAG 2.2.',
      category: 'Digital Accessibility',
      status: 'accepted',
    },
  ];

  const [changes, setChanges] = useState<ChangeItem[]>(initialChanges);
  const [editableSuggestedText, setEditableSuggestedText] = useState(review?.suggestedContent || '');
  const [selectedChangeId, setSelectedChangeId] = useState<string>('c-1');
  const [copied, setCopied] = useState(false);

  const handleAcceptChange = (id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'accepted' } : c));
    toast('Suggestion accepted and applied');
  };

  const handleRejectChange = (id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    toast('Suggestion rejected');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editableSuggestedText);
    setCopied(true);
    toast('Final compliant content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReRunReview = () => {
    toast('Re-running BrandSense audit on edited draft...');
    router.push('/review/results');
  };

  const selectedChange = changes.find(c => c.id === selectedChangeId) || changes[0];

  if (!review && !loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-xl border border-[#C4D5E0] p-12 text-center max-w-xl mx-auto mt-8 shadow-subtle">
          <FileCheck className="w-12 h-12 text-[#416F89]/40 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-heading font-extrabold text-[#20364A]">No Content in Rewrite Studio</h2>
          <p className="text-xs text-[#4F6576] mt-2 mb-6 leading-relaxed">
            Run an AI brand review first to see side-by-side compliance rewrites and surgical sentence replacements.
          </p>
          <Link href="/review/new">
            <Button variant="primary" size="md">
              Start New Review →
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!review) return null;

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Rewrite studio</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                AI Rewrite Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
                Intent-Preserved
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Interactive side-by-side comparison. Accept individual suggestions or manually refine your draft.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Copy className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={handleCopyText}
            >
              {copied ? 'Copied!' : 'Copy Final Text'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={handleReRunReview}
            >
              Re-Scan Content
            </Button>
          </div>
        </div>

        {/* Dual Editor Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Original Content */}
          <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between overflow-hidden">
            <div className="p-4 bg-[#EDF3F6]/70 border-b border-[#C4D5E0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F6576]" aria-hidden="true" />
                <h2 className="text-xs font-bold text-[#20364A] uppercase tracking-wider">
                  Original Submitted Draft
                </h2>
              </div>
              <span className="text-xs text-[#4F6576] font-mono">Unmodified source</span>
            </div>

            <div className="p-6 text-xs sm:text-sm leading-relaxed text-[#20364A] space-y-4 font-sans flex-1">
              <p>
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-1')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-1'
                      ? 'bg-[#A94842]/25 text-[#20364A] border-[#A94842] font-bold ring-2 ring-[#A94842]/30'
                      : 'bg-[#A94842]/15 text-[#20364A] border-[#A94842]/50 hover:bg-[#A94842]/20'
                  }`}
                  aria-label="Inspect change: Guarantees 100% elimination of all regulatory compliance fines"
                >
                  BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
                </button>{' '}
                Our{' '}
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-2')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-2'
                      ? 'bg-[#F4D77B]/40 text-[#20364A] border-[#9A682D] font-bold ring-2 ring-[#F4D77B]'
                      : 'bg-[#F4D77B]/20 text-[#20364A] border-[#9A682D]/40 hover:bg-[#F4D77B]/30'
                  }`}
                  aria-label="Inspect change: Disruptive miracle platform"
                >
                  disruptive miracle platform
                </button>{' '}
                revolutionises how your team reviews content. Connect your repository with{' '}
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-3')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-3'
                      ? 'bg-[#D5E3EC] text-[#20364A] border-[#416F89] font-bold ring-2 ring-[#416F89]/30'
                      : 'bg-[#EDF3F6] text-[#20364A] border-[#416F89]/30 hover:bg-[#D5E3EC]/50'
                  }`}
                  aria-label="Inspect change: brand sense Cloud Sync"
                >
                  brand sense Cloud Sync
                </button>{' '}
                in one click.
              </p>

              <p>
                Clients typically see an{' '}
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-4')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-4'
                      ? 'bg-[#A94842]/25 text-[#20364A] border-[#A94842] font-bold ring-2 ring-[#A94842]/30'
                      : 'bg-[#A94842]/15 text-[#20364A] border-[#A94842]/50 hover:bg-[#A94842]/20'
                  }`}
                  aria-label="Inspect change: Instant 450% ROI claim"
                >
                  instant 450% ROI on their enterprise license in quarter one.
                </button>{' '}
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-5')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-5'
                      ? 'bg-[#F4D77B]/40 text-[#20364A] border-[#9A682D] font-bold ring-2 ring-[#F4D77B]'
                      : 'bg-[#F4D77B]/20 text-[#20364A] border-[#9A682D]/40 hover:bg-[#F4D77B]/30'
                  }`}
                  aria-label="Inspect change: Aggressive brand voice dinosaur quote"
                >
                  Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!
                </button>{' '}
                <button
                  type="button"
                  onClick={() => setSelectedChangeId('c-6')}
                  className={`text-left inline px-1 py-0.5 rounded transition-all border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    selectedChangeId === 'c-6'
                      ? 'bg-[#D5E3EC] text-[#20364A] border-[#4F6576] font-bold ring-2 ring-[#4F6576]/30'
                      : 'bg-[#EDF3F6] text-[#20364A] border-[#4F6576]/30 hover:bg-[#D5E3EC]/50'
                  }`}
                  aria-label="Inspect change: Directional visual cue green button"
                >
                  Click the green button on the right side of the screen
                </button>{' '}
                to download.
              </p>
            </div>

            <div className="p-4 bg-[#EDF3F6]/50 border-t border-[#C4D5E0] text-xs text-[#4F6576] flex items-center justify-between">
              <span>Click highlighted section to view explanation</span>
              <span className="font-bold text-[#20364A]">6 items flagged</span>
            </div>
          </div>

          {/* Right Column: AI Compliant Suggested Version */}
          <div className="bg-white rounded-xl border border-[#416F89]/40 shadow-subtle flex flex-col justify-between overflow-hidden">
            <div className="p-4 bg-[#416F89]/10 border-b border-[#416F89]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#416F89]" aria-hidden="true" />
                <h2 className="text-xs font-bold text-[#20364A] uppercase tracking-wider">
                  Suggested Compliant Version (Editable)
                </h2>
              </div>
              <span className="text-xs font-bold text-[#315C74] bg-[#D5E3EC] px-2.5 py-0.5 rounded">
                Active Draft
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <label htmlFor="editable-suggested-text" className="sr-only">
                Editable suggested compliant text
              </label>
              <textarea
                id="editable-suggested-text"
                rows={11}
                value={editableSuggestedText}
                onChange={(e) => setEditableSuggestedText(e.target.value)}
                className="w-full flex-1 p-4 text-xs sm:text-sm font-sans bg-[#EDF3F6]/30 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A] leading-relaxed resize-none"
              />
            </div>

            <div className="p-4 bg-[#416F89]/5 border-t border-[#416F89]/15 text-xs text-[#20364A] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1F7560]" aria-hidden="true" />
                <span>You can directly type and edit any text in this workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setEditableSuggestedText(review.suggestedContent)}
                className="text-xs text-[#416F89] hover:underline font-bold flex items-center gap-1 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
              >
                <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Change Explanation Card */}
        {selectedChange && (
          <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C4D5E0]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold">
                  {selectedChange.category}
                </span>
                <span className="text-xs text-[#4F6576]">Change #{selectedChange.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedChange.status === 'accepted' ? 'primary' : 'outline'}
                  leftIcon={<Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => handleAcceptChange(selectedChange.id)}
                >
                  Accept Change
                </Button>
                <Button
                  size="sm"
                  variant={selectedChange.status === 'rejected' ? 'destructive' : 'outline'}
                  leftIcon={<Undo2 className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => handleRejectChange(selectedChange.id)}
                >
                  Keep Original
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-xs uppercase font-bold text-[#4F6576] block mb-1">
                  Original phrasing
                </span>
                <p className="p-3 bg-[#A94842]/10 border border-[#A94842]/25 rounded-lg text-[#20364A] font-mono">
                  “{selectedChange.original}”
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-[#416F89] block mb-1">
                  Compliant replacement
                </span>
                <p className="p-3 bg-[#416F89]/10 border border-[#416F89]/25 rounded-lg text-[#20364A] font-mono font-semibold">
                  “{selectedChange.replacement}”
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#C4D5E0] text-xs text-[#4F6576]">
              <span className="font-bold text-[#20364A]">Why this was updated: </span>
              <span>{selectedChange.reason}</span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
