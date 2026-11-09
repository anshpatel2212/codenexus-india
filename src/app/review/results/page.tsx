'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScoreMeter } from '@/components/ui/ScoreMeter';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  Sparkles, 
  Check, 
  X, 
  Edit3, 
  Send, 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Eye,
  FileCheck,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { sampleReviews } from '@/data/mock-data';
import { sampleFindings } from '@/data/mock-findings';
import { Finding, FindingCategory, ReviewItem } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ReviewResultsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Try reading user-scoped review from localStorage
    if (typeof window !== 'undefined') {
      try {
        const userKey = user?.id ? `brandsense_current_review_${user.id}` : null;
        const stored = (userKey && localStorage.getItem(userKey)) || localStorage.getItem('brandsense_current_review');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!user?.organizationId || parsed.author?.email === user?.email || (parsed as any).organization_id === user?.organizationId || user?.isDemo) {
            setCurrentReview(parsed);
            if (parsed.findings) setFindings(parsed.findings);
            setLoading(false);
          }
        }
      } catch {}
    }

    // 2. Fetch reviews for this organization
    apiClient.getReviews(user?.organizationId).then((reviews) => {
      if (!active) return;
      if (reviews.length > 0) {
        setCurrentReview((prev) => prev || reviews[0]);
        if (reviews[0].findings && reviews[0].findings.length > 0) {
          setFindings((prev) => (prev.length > 0 ? prev : reviews[0].findings));
        }
        setLoading(false);
      } else if (user?.isDemo || user?.organizationId === 'org-demo-brandsense' || !user?.organizationId) {
        // Fallback for demo organization
        setCurrentReview((prev) => prev || sampleReviews[0]);
        setFindings((prev) => (prev.length > 0 ? prev : sampleFindings));
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const review = currentReview;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvidence, setExpandedEvidence] = useState<{ [id: string]: boolean }>({ 'f-1': true });
  const [activeSourceModal, setActiveSourceModal] = useState<Finding | null>(null);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [editedFix, setEditedFix] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSourceModal) setActiveSourceModal(null);
        if (editingFinding) setEditingFinding(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeSourceModal, editingFinding]);

  const handleAcceptFinding = async (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: 'accepted' } : f));
    await apiClient.updateFinding(id, 'accepted');
    toast('Suggestion accepted and applied to pending draft');
  };

  const handleRejectFinding = async (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: 'rejected' } : f));
    await apiClient.updateFinding(id, 'rejected');
    toast('Suggestion rejected by reviewer');
  };

  const handleSaveEdit = async (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, suggestedFix: editedFix, status: 'modified' } : f));
    await apiClient.updateFinding(id, 'modified', editedFix);
    setEditingFinding(null);
    toast('Custom wording revision saved');
  };

  const handleSendToReviewer = () => {
    toast('Review package forwarded to Sarah Chen, Esq. (Legal & Compliance)');
  };

  const handleDownloadReport = async () => {
    if (!review) return;
    if (review.filePath) {
      toast('Generating secure download link...');
      const signedUrl = await apiClient.getSignedUrl('review-files', review.filePath);
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    const reportData = `# BrandSense Compliance Audit Report\nReview ID: ${review.id}\nTitle: ${review.title}\nScore: ${review.overallScore}%\nStatus: ${review.status}\n\n## Content:\n${review.originalContent}\n\n## Evidentiary Findings (${findings.length}):\n${findings.map((f, i) => `${i + 1}. [${f.severity}] ${f.category}: ${f.reason}\n   Evidence: "${f.evidence}"\n   Suggested Fix: "${f.suggestedFix}"`).join('\n')}`;
    const blob = new Blob([reportData], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrandSense_Report_${review.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Compliance report downloaded successfully');
  };

  const categories: FindingCategory[] = [
    'Tone and Voice',
    'Terminology',
    'Facts and Claims',
    'Promotional Claims',
    'Visual Consistency',
    'Accessibility',
  ];

  const filteredFindings = findings.filter(f => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || f.severity === selectedSeverity;
    const matchesVerification = selectedVerification === 'All' ||
      (selectedVerification === 'verified' && f.verificationStatus === 'verified' && !f.escalatedToHuman) ||
      (selectedVerification === 'escalated' && (f.verificationStatus === 'escalated' || f.escalatedToHuman || f.severity === 'Needs Human Review'));
    const matchesSearch = 
      f.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.sourceDocument && f.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSeverity && matchesVerification && matchesSearch;
  });

  if (!review && !loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-xl border border-[#C4D5E0] p-12 text-center max-w-xl mx-auto mt-8 shadow-subtle">
          <FileCheck className="w-12 h-12 text-[#416F89]/40 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-heading font-extrabold text-[#20364A]">No Active Reviews in Workspace</h2>
          <p className="text-xs text-[#4F6576] mt-2 mb-6 leading-relaxed">
            Submit a creative draft, press release, or campaign document to run an automated BrandSense compliance audit.
          </p>
          <Link href="/review/new">
            <Button variant="primary" size="md">
              Start New Review &#x2192;
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!review) return null;

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#C4D5E0]">
            <div>
              <span className="bs-eyebrow block mb-2">Review findings</span>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono text-[#4F6576] font-bold">{review.id}</span>
                <span className="text-[#C4D5E0]" aria-hidden="true">•</span>
                <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC]/70 text-[#20364A] font-bold text-xs">
                  {review.contentType}
                </span>
                <span className="text-[#C4D5E0]" aria-hidden="true">•</span>
                <StatusBadge status={review.status} size="sm" />
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#20364A] tracking-tight">
                {review.title}
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
                Author: <strong className="text-[#20364A]">{review.author.name}</strong> • Brand Policy: <strong className="text-[#20364A]">{review.brandProfile}</strong> • Scanned Nov 03, 2026
              </p>
            </div>

            <div className="flex items-center gap-6 self-start lg:self-center">
              <ScoreMeter score={review.overallScore} size="lg" />

              <div className="flex flex-col gap-2">
                <Link href="/review/rewrite">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" aria-hidden="true" />}
                  >
                    Rewrite Studio
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#4F6576] mb-3">
              Governance Category Breakdown
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const score = review.categoryScores[cat] || 85;
                const isCritical = score < 70;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`p-3 rounded-lg border text-xs text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      selectedCategory === cat 
                        ? 'bg-[#416F89]/15 border-[#416F89] shadow-sm' 
                        : 'bg-white border-[#C4D5E0] hover:bg-[#F4F8FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#20364A] truncate pr-1">{cat}</span>
                      <span className={`font-mono font-extrabold ${isCritical ? 'text-[#A94842]' : 'text-[#416F89]'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-[#D5E3EC] h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className={`h-full rounded-full ${
                          score >= 90 ? 'bg-[#1F7560]' : score >= 75 ? 'bg-[#416F89]' : 'bg-[#A94842]'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#416F89]" aria-hidden="true" />
              <span>Submitted Content with Highlighted Evidence</span>
            </h2>
            <span className="text-xs text-[#4F6576] font-bold">
              {findings.length} total findings detected
            </span>
          </div>

          <div className="p-5 rounded-lg bg-[#D5E3EC]/35 border border-[#C4D5E0] text-xs sm:text-sm text-[#20364A] leading-relaxed font-sans space-y-3">
            <p>
              <mark className="bg-[#A94842]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#A94842]">
                BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
              </mark>{' '}
              Our <mark className="bg-[#F4D77B]/40 text-[#20364A] px-1 rounded border-b-2 border-[#9A682D]">disruptive miracle platform</mark> revolutionises how your team reviews content. Connect your repository with <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">brand sense Cloud Sync</mark> in one click.
            </p>
            <p>
              Clients typically see an <mark className="bg-[#A94842]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#A94842]">instant 450% ROI on their enterprise license in quarter one</mark>. <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!</mark> <mark className="bg-white/80 text-[#20364A] px-1 rounded border-b-2 border-[#4F6576]">Click the green button on the right side of the screen</mark> to download.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#C4D5E0]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#4F6576] uppercase tracking-wider">Filter:</span>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by governance category"
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#20364A] focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filter by severity level"
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#20364A] focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89]"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Needs Human Review">Needs Human Review</option>
            </select>

            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              aria-label="Filter by verification status"
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#20364A] focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89]"
            >
              <option value="All">All Verification Statuses</option>
              <option value="verified">Dual-Pass Verified</option>
              <option value="escalated">Escalated to Human Review</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#4F6576] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, citations..."
              aria-label="Search findings, citations, and evidence"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
            />
          </div>
        </div>

        {/* Detailed Findings Cards */}
        <div className="space-y-4">
          <h2 className="sr-only">Detailed Audit Findings</h2>
          {filteredFindings.map((finding) => {
            const isEvidenceOpen = expandedEvidence[finding.id];
            const isAccepted = finding.status === 'accepted';
            const isRejected = finding.status === 'rejected';

            return (
              <div
                key={finding.id}
                className={`p-6 rounded-xl border transition-all bg-white shadow-subtle ${
                  isAccepted ? 'border-[#1F7560] ring-1 ring-[#1F7560]/30' :
                  isRejected ? 'border-[#C4D5E0] opacity-60' : 'border-[#C4D5E0] hover:border-[#416F89]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C4D5E0]">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC]/70 text-[#20364A]">
                      {finding.category}
                    </span>
                    {finding.verificationStatus === 'verified' && !finding.escalatedToHuman ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#1F7560]/15 text-[#1F7560] border border-[#1F7560]/30">
                        <ShieldCheck className="w-3 h-3 text-[#1F7560]" /> Dual-Pass Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#9A682D]/15 text-[#9A682D] border border-[#9A682D]/30">
                        <AlertCircle className="w-3 h-3 text-[#9A682D]" /> Escalated to Human Review
                      </span>
                    )}
                    {finding.sourcePage ? (
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#EDF3F6] text-[#4F6576] border border-[#C4D5E0]">
                        Page {finding.sourcePage}
                      </span>
                    ) : null}
                    <span className="text-xs text-[#4F6576] font-bold">
                      Confidence: {finding.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1F7560] bg-[#1F7560]/10 px-2.5 py-1 rounded-md border border-[#1F7560]/20">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" /> Suggestion Accepted
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6576] bg-[#EDF3F6] px-2.5 py-1 rounded-md border border-[#C4D5E0]">
                        <X className="w-3.5 h-3.5" aria-hidden="true" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#20364A]">
                    {finding.reason}
                  </h3>

                  {/* Flagged quote */}
                  <div className="p-3 bg-[#A94842]/10 border-l-4 border-[#A94842] rounded-r-lg text-xs text-[#20364A] font-mono">
                    <span className="text-xs uppercase font-bold text-[#A94842] block mb-1">
                      Flagged Segment:
                    </span>
                    {finding.evidence}
                  </div>

                  <p className="text-xs sm:text-sm text-[#4F6576] leading-relaxed">
                    {finding.explanation}
                  </p>

                  {/* Suggested Fix */}
                  <div className="p-4 bg-[#416F89]/10 border border-[#416F89]/25 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-[#20364A] mb-1">
                      <span>Compliant Intent-Preserving Fix</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFinding(finding);
                          setEditedFix(finding.suggestedFix);
                        }}
                        className="text-xs font-bold text-[#416F89] hover:underline flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                      >
                        <Edit3 className="w-3 h-3" aria-hidden="true" />
                        Customize wording
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[#20364A] font-semibold italic">
                      {finding.suggestedFix}
                    </p>
                  </div>

                  {/* Expandable Evidence */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setExpandedEvidence(prev => ({ ...prev, [finding.id]: !prev[finding.id] }))}
                      className="text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                      aria-expanded={isEvidenceOpen}
                    >
                      {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
                      <span>{isEvidenceOpen ? 'Hide Evidentiary Source' : 'View Evidentiary Citation & Policy Source'}</span>
                    </button>

                    {isEvidenceOpen && (
                      <div className="mt-3 p-4 bg-[#EDF3F6]/70 rounded-lg border border-[#C4D5E0] text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#20364A] flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-[#416F89]" aria-hidden="true" />
                            {finding.sourceDocument}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveSourceModal(finding)}
                            className="text-[#416F89] hover:underline font-bold flex items-center gap-1 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                          >
                            <ExternalLink className="w-3 h-3" aria-hidden="true" /> Open Document
                          </button>
                        </div>
                        <p className="text-[#4F6576] text-xs">
                          {finding.sourceSection}
                          {finding.sourcePage ? ` • Document Page ${finding.sourcePage}` : ''}
                        </p>
                        {finding.verificationNotes ? (
                          <div className="mt-2 p-2.5 rounded bg-white border border-[#C4D5E0] text-[11px] text-[#20364A]">
                            <span className="font-bold text-[#315C74] block mb-0.5">Dual-Pass Verification Audit:</span>
                            {finding.verificationNotes}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#C4D5E0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isAccepted ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={<Check className="w-3.5 h-3.5" aria-hidden="true" />}
                      onClick={() => handleAcceptFinding(finding.id)}
                    >
                      Accept Fix
                    </Button>

                    <Button
                      variant={isRejected ? 'destructive' : 'outline'}
                      size="sm"
                      leftIcon={<X className="w-3.5 h-3.5" aria-hidden="true" />}
                      onClick={() => handleRejectFinding(finding.id)}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                      onClick={() => setActiveSourceModal(finding)}
                    >
                      Inspect Source
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />}
                    onClick={handleSendToReviewer}
                  >
                    Send to Legal Counsel
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Source Modal */}
        {activeSourceModal && (
          <div
            className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="source-modal-title"
          >
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#C4D5E0]">
                <div>
                  <span className="text-xs font-bold uppercase text-[#20364A] bg-[#D5E3EC] px-2.5 py-0.5 rounded">
                    Source Document Verification
                  </span>
                  <h2 id="source-modal-title" className="font-heading text-base font-bold text-[#20364A] mt-1">
                    {activeSourceModal.sourceDocument}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSourceModal(null)}
                  className="p-1 rounded text-[#4F6576] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-label="Close document preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 p-5 bg-[#EDF3F6]/60 rounded-lg border border-[#C4D5E0] max-h-80 overflow-y-auto text-xs sm:text-sm leading-relaxed text-[#20364A] font-sans space-y-3">
                <div className="font-bold text-[#20364A] border-b border-[#C4D5E0] pb-2">
                  {activeSourceModal.sourceSection}
                </div>
                <p>
                  4.2.1 Prohibited Performance Warranties: Marketing materials, digital campaigns, and executive press statements must strictly avoid unqualified absolute terms including but not limited to: &quot;guarantees 100% elimination&quot;, &quot;zero regulatory exposure&quot;, or &quot;miraculous compliance&quot;.
                </p>
                <div className="p-3 bg-[#416F89]/10 rounded-lg border border-[#416F89]/25 text-[#20364A] font-semibold">
                  <strong>Guideline Mandate:</strong> Formulate claims using validated capabilities: &quot;designed to assist in reducing regulatory exposure&quot;.
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#C4D5E0] text-xs text-[#4F6576]">
                <span>Verified Hash: SHA-256 (Acme_Policy_4.2)</span>
                <Button size="sm" variant="primary" onClick={() => setActiveSourceModal(null)}>
                  Done Reviewing
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingFinding && (
          <div
            className="fixed inset-0 bg-[#20364A]/60 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
                <h2 id="edit-modal-title" className="font-heading text-base font-bold text-[#20364A]">
                  Customize Compliant Suggestion
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingFinding(null)}
                  className="p-1 rounded text-[#4F6576] hover:text-[#20364A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
                  aria-label="Close edit dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <p className="text-xs text-[#4F6576]">
                  Edit the suggested text while ensuring it still satisfies: <strong>{editingFinding.sourceSection}</strong>
                </p>
                <label htmlFor="custom-wording-input" className="sr-only">
                  Custom wording suggestion
                </label>
                <textarea
                  id="custom-wording-input"
                  rows={4}
                  value={editedFix}
                  onChange={(e) => setEditedFix(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A] font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setEditingFinding(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={() => handleSaveEdit(editingFinding.id)}>
                  Save Custom Wording
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
