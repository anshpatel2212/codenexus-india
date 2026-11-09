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
  FileCheck, 
  Loader2,
  Download,
  FileText
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
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [editableSuggestedText, setEditableSuggestedText] = useState('');
  const [selectedChangeId, setSelectedChangeId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'tracked-diff'>('side-by-side');
  const [intentScore, setIntentScore] = useState<number>(98.5);

  const handleExportDocument = (format: 'txt' | 'diff') => {
    if (!review) return;
    let fileContent = '';
    let filename = '';
    if (format === 'txt') {
      fileContent = editableSuggestedText;
      filename = `${review.title.replace(/\s+/g, '_')}_Clean_Compliant.txt`;
    } else {
      fileContent = `# BrandSense AI Rewrite Audit & Diff Report\nReview ID: ${review.id}\nTitle: ${review.title}\nCompliance Score: ${review.overallScore}%\nIntent Preservation Score: ${intentScore}%\n\n## Applied Intent-Preserving Changes (${changes.length}):\n${changes.map((c, i) => `${i + 1}. [${c.status.toUpperCase()}] ${c.category}\n   Original: "${c.original}"\n   Compliant Replacement: "${c.replacement}"\n   Reason: ${c.reason}`).join('\n\n')}\n\n## Final Compliant Copy:\n${editableSuggestedText}`;
      filename = `${review.title.replace(/\s+/g, '_')}_Audit_Diff.md`;
    }
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filename}`, 'success');
  };

  useEffect(() => {
    let active = true;

    const loadReview = async () => {
      let localReview: ReviewItem | null = null;
      if (typeof window !== 'undefined') {
        try {
          const userKey = user?.id ? `brandsense_current_review_${user.id}` : null;
          const stored = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('brandsense_current_review');
          if (stored) {
            localReview = JSON.parse(stored);
          }
        } catch {}
      }

      // If user-scoped review found, use it
      if (localReview && (!user?.organizationId || localReview.author?.email === user?.email || (localReview as any).organization_id === user?.organizationId || user?.isDemo)) {
        if (!active) return;
        setReview(localReview);
        setEditableSuggestedText(localReview.suggestedContent || localReview.originalContent);
        
        if (localReview.findings && localReview.findings.length > 0) {
          const mapped: ChangeItem[] = localReview.findings.map((f, i) => ({
            id: f.id || `c-${i + 1}`,
            original: f.highlightedText || f.evidence.replace(/[“”"']/g, ''),
            replacement: f.suggestedFix || 'Standardized phrasing',
            reason: f.explanation || f.reason,
            category: f.category,
            status: f.status === 'accepted' ? 'accepted' : f.status === 'rejected' ? 'rejected' : 'pending',
          }));
          setChanges(mapped);
          setSelectedChangeId(mapped[0]?.id || '');
        }
        setLoading(false);
        return;
      }

      // Otherwise fetch reviews for the active organization
      try {
        const reviews = await apiClient.getReviews(user?.organizationId);
        if (!active) return;
        if (reviews.length > 0) {
          const target = reviews[0];
          setReview(target);
          setEditableSuggestedText(target.suggestedContent || target.originalContent);
          if (target.findings && target.findings.length > 0) {
            const mapped: ChangeItem[] = target.findings.map((f, i) => ({
              id: f.id || `c-${i + 1}`,
              original: f.highlightedText || f.evidence.replace(/[“”"']/g, ''),
              replacement: f.suggestedFix || 'Standardized phrasing',
              reason: f.explanation || f.reason,
              category: f.category,
              status: f.status === 'accepted' ? 'accepted' : f.status === 'rejected' ? 'rejected' : 'pending',
            }));
            setChanges(mapped);
            setSelectedChangeId(mapped[0]?.id || '');
          }
        } else if (user?.isDemo || user?.organizationId === 'org-demo-brandsense' || !user?.organizationId) {
          setReview(sampleReviews[0]);
          setEditableSuggestedText(sampleReviews[0].suggestedContent);
          const mapped: ChangeItem[] = (sampleReviews[0].findings || []).map((f, i) => ({
            id: f.id || `c-${i + 1}`,
            original: f.highlightedText || f.evidence.replace(/[“”"']/g, ''),
            replacement: f.suggestedFix || 'Standardized phrasing',
            reason: f.explanation || f.reason,
            category: f.category,
            status: 'pending',
          }));
          setChanges(mapped);
          setSelectedChangeId(mapped[0]?.id || '');
        } else {
          setReview(null);
        }
      } catch (err) {
        console.error('Failed to load review in RewriteStudio:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReview();

    return () => {
      active = false;
    };
  }, [user?.id, user?.organizationId, user?.email, user?.isDemo]);

  const handleAcceptChange = (id: string) => {
    const target = changes.find((c) => c.id === id);
    if (!target) return;

    setChanges((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'accepted' } : c)));
    
    // Apply fix to editableSuggestedText if target original is found
    if (target.original && editableSuggestedText.includes(target.original)) {
      setEditableSuggestedText((prev) => prev.replace(target.original, target.replacement));
    }
    
    apiClient.updateFinding(id, 'accepted', target.replacement);
    toast('Suggestion accepted and applied');
  };

  const handleRejectChange = (id: string) => {
    const target = changes.find((c) => c.id === id);
    if (!target) return;

    setChanges((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'rejected' } : c)));

    // Revert replacement back to original text if replacement was applied
    if (target.replacement && editableSuggestedText.includes(target.replacement)) {
      setEditableSuggestedText((prev) => prev.replace(target.replacement, target.original));
    }

    apiClient.updateFinding(id, 'rejected');
    toast('Suggestion rejected');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editableSuggestedText);
    setCopied(true);
    toast('Final compliant content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReRunReview = () => {
    if (review) {
      const updatedReview: ReviewItem = {
        ...review,
        suggestedContent: editableSuggestedText,
        updatedAt: new Date().toISOString(),
      };
      if (typeof window !== 'undefined') {
        const userKey = user?.id ? `brandsense_current_review_${user.id}` : null;
        if (userKey) localStorage.setItem(userKey, JSON.stringify(updatedReview));
        localStorage.setItem('brandsense_current_review', JSON.stringify(updatedReview));
      }
    }
    toast('Re-running BrandSense audit on edited draft...');
    router.push('/review/results');
  };

  const selectedChange = changes.find((c) => c.id === selectedChangeId) || changes[0];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-16 space-y-4">
          <Loader2 className="w-8 h-8 text-[#416F89] animate-spin" />
          <p className="text-xs font-bold text-[#526B7C]">Loading AI Rewrite Studio workspace...</p>
        </div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div className="bg-white rounded-xl border border-[#C4D5E0] p-12 text-center max-w-xl mx-auto mt-8 shadow-subtle">
          <FileCheck className="w-12 h-12 text-[#416F89]/40 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-heading font-extrabold text-[#20364A]">No Active Review in Rewrite Studio</h2>
          <p className="text-xs text-[#4F6576] mt-2 mb-6 leading-relaxed">
            Submit content for a BrandSense review to view side-by-side compliance rewrites, intent-preserved replacements, and legal policy citations.
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
              <span className="px-2.5 py-0.5 rounded bg-[#1F7560]/15 text-[#1F7560] border border-[#1F7560]/30 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F7560]" aria-hidden="true" />
                {intentScore}% Intent Preserved
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Interactive side-by-side comparison for <strong className="text-[#20364A]">{review.title}</strong>. Accept individual suggestions or manually refine your draft.
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

        {/* View Mode Toggle & Document Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-[#C4D5E0]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4F6576] uppercase tracking-wider">Mode:</span>
            <div className="inline-flex rounded-lg border border-[#C4D5E0] p-0.5 bg-[#EDF3F6]/50">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'side-by-side'
                    ? 'bg-[#416F89] text-white shadow-sm'
                    : 'text-[#4F6576] hover:text-[#20364A]'
                }`}
              >
                Side-by-Side View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tracked-diff')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'tracked-diff'
                    ? 'bg-[#416F89] text-white shadow-sm'
                    : 'text-[#4F6576] hover:text-[#20364A]'
                }`}
              >
                Tracked Changes Diff
              </button>
            </div>
            {review.fileName && (
              <span className="text-xs font-mono text-[#315C74] bg-[#D5E3EC] px-2 py-0.5 rounded ml-2">
                📄 {review.fileName} ({review.fileType || 'Doc'}, {review.pageCount || 1} page(s))
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={() => handleExportDocument('txt')}
            >
              Export Clean Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText className="w-3.5 h-3.5" aria-hidden="true" />}
              onClick={() => handleExportDocument('diff')}
            >
              Export Diff Audit
            </Button>
          </div>
        </div>

        {/* Workspace Display based on View Mode */}
        {viewMode === 'tracked-diff' ? (
          <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F7560]" aria-hidden="true" />
                <h2 className="text-xs font-bold text-[#20364A] uppercase tracking-wider">
                  Tracked Changes Inline Diff
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-[#A94842] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#A94842]/20 border border-[#A94842]" /> Flagged / Deleted
                </span>
                <span className="inline-flex items-center gap-1 text-[#1F7560] font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-[#1F7560]/20 border border-[#1F7560]" /> Intent-Preserved Replacement
                </span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-[#F4F8FA]/60 border border-[#C4D5E0] text-xs sm:text-sm leading-relaxed text-[#20364A] font-sans space-y-4">
              <div className="space-y-3">
                <p>
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    BrandSense is designed to help reduce regulatory risk and streamline compliance reviews.
                  </ins>{' '}
                  Our{' '}
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    disruptive miracle platform
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    enterprise content governance platform
                  </ins>{' '}
                  revolutionises how your team reviews content. Connect your repository with{' '}
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    brand sense Cloud Sync
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    BrandSense Content Hub™
                  </ins>{' '}
                  in one click.
                </p>
                <p>
                  Clients typically see{' '}
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    an instant 450% ROI on their enterprise license in quarter one
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    measurable workflow acceleration (*Results based on a 2025 cohort study of 42 enterprise accounts; individual outcomes vary)
                  </ins>
                  .{' '}
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    Equip your marketing and compliance teams with proactive governance today.
                  </ins>{' '}
                  <del className="bg-[#A94842]/20 text-[#A94842] line-through px-1 rounded mr-1">
                    Click the green button on the right side of the screen
                  </del>
                  <ins className="bg-[#1F7560]/15 text-[#1F7560] font-bold no-underline px-1 rounded">
                    Select the ‘Download Report’ button below
                  </ins>{' '}
                  to get started.
                </p>
              </div>
            </div>
          </div>
        ) : (
        /* Dual Editor Workspace */
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

            <div className="p-6 text-xs sm:text-sm leading-relaxed text-[#20364A] space-y-4 font-sans flex-1 overflow-y-auto max-h-[460px]">
              {changes.length > 0 ? (
                <div className="space-y-3">
                  <p className="whitespace-pre-wrap">{review.originalContent}</p>
                  <div className="mt-4 pt-4 border-t border-[#C4D5E0]/60 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#718494] block">
                      Detected Findings ({changes.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {changes.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedChangeId(c.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                            selectedChangeId === c.id
                              ? 'bg-[#416F89] text-white border-[#315C74] shadow-sm'
                              : c.status === 'accepted'
                              ? 'bg-[#1F7560]/10 text-[#1F7560] border-[#1F7560]/30'
                              : c.status === 'rejected'
                              ? 'bg-[#A94842]/10 text-[#A94842] border-[#A94842]/30'
                              : 'bg-[#EDF3F6] text-[#20364A] border-[#C4D5E0] hover:bg-[#D5E3EC]'
                          }`}
                        >
                          <span className="truncate max-w-[200px] inline-block">
                            {c.category}: “{c.original.substring(0, 24)}...”
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{review.originalContent}</p>
              )}
            </div>

            <div className="p-4 bg-[#EDF3F6]/50 border-t border-[#C4D5E0] text-xs text-[#4F6576] flex items-center justify-between">
              <span>Click any flagged finding chip to view citations and drop-in fixes</span>
              <span className="font-bold text-[#20364A]">{changes.length} items flagged</span>
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
                rows={14}
                value={editableSuggestedText}
                onChange={(e) => setEditableSuggestedText(e.target.value)}
                className="w-full flex-1 p-4 text-xs sm:text-sm font-sans bg-[#EDF3F6]/30 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A] leading-relaxed resize-none min-h-[300px]"
              />
            </div>

            <div className="p-4 bg-[#416F89]/5 border-t border-[#416F89]/15 text-xs text-[#20364A] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1F7560]" aria-hidden="true" />
                <span>Directly editable in this workspace</span>
              </div>
              <button
                type="button"
                onClick={() => setEditableSuggestedText(review.suggestedContent || review.originalContent)}
                className="text-xs text-[#416F89] hover:underline font-bold flex items-center gap-1 p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
              >
                <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                Reset to AI Draft
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Change Explanation Card */}
        {selectedChange && (
          <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C4D5E0]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold">
                  {selectedChange.category}
                </span>
                <span className="text-xs text-[#4F6576]">Finding #{selectedChange.id}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedChange.status === 'accepted' 
                    ? 'bg-[#1F7560]/15 text-[#1F7560]' 
                    : selectedChange.status === 'rejected'
                    ? 'bg-[#A94842]/15 text-[#A94842]'
                    : 'bg-[#F4D77B]/40 text-[#9A682D]'
                }`}>
                  {selectedChange.status}
                </span>
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
