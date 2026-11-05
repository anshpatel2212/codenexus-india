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
  Eye
} from 'lucide-react';
import { sampleReviews } from '@/data/mock-data';
import { sampleFindings } from '@/data/mock-findings';
<<<<<<< HEAD
import { Finding, FindingCategory, ReviewItem } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ReviewResultsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentReview, setCurrentReview] = useState<ReviewItem>(sampleReviews[0]);
  const [findings, setFindings] = useState<Finding[]>(sampleFindings);

  useEffect(() => {
    let active = true;
    apiClient.getReviews(user?.organizationId).then((reviews) => {
      if (active && reviews.length > 0) {
        setCurrentReview(reviews[0]);
        if (reviews[0].findings && reviews[0].findings.length > 0) {
          setFindings(reviews[0].findings);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const review = currentReview;
=======
import { Finding, FindingCategory } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function ReviewResultsPage() {
  const { toast } = useToast();
  const review = sampleReviews[0];

  const [findings, setFindings] = useState<Finding[]>(sampleFindings);
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvidence, setExpandedEvidence] = useState<{ [id: string]: boolean }>({ 'f-1': true });
  const [activeSourceModal, setActiveSourceModal] = useState<Finding | null>(null);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [editedFix, setEditedFix] = useState('');

<<<<<<< HEAD
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
=======
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

  const handleAcceptFinding = (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: 'accepted' } : f));
    toast('Suggestion accepted and applied to pending draft');
  };

  const handleRejectFinding = (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, status: 'rejected' } : f));
    toast('Suggestion rejected by reviewer');
  };

  const handleSaveEdit = (id: string) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, suggestedFix: editedFix, status: 'modified' } : f));
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
    setEditingFinding(null);
    toast('Custom wording revision saved');
  };

  const handleSendToReviewer = () => {
    toast('Review package forwarded to Sarah Chen, Esq. (Legal & Compliance)');
  };

<<<<<<< HEAD
  const handleDownloadReport = async () => {
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

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
    const matchesSearch = 
      f.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.evidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#C4D5E0]">
            <div>
              <span className="bs-eyebrow block mb-2">Review findings</span>
              <div className="flex flex-wrap items-center gap-2 mb-2">
<<<<<<< HEAD
                <span className="text-xs font-mono text-[#718494] font-bold">{review.id}</span>
                <span className="text-[#C4D5E0]">•</span>
                <span className="px-2 py-0.5 rounded bg-[#D5E3EC]/70 text-[#31566D] font-bold text-xs">
                  {review.contentType}
                </span>
                <span className="text-[#C4D5E0]">•</span>
=======
                <span className="text-xs font-mono text-[#4F6576] font-bold">{review.id}</span>
                <span className="text-[#C4D5E0]" aria-hidden="true">•</span>
                <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC]/70 text-[#20364A] font-bold text-xs">
                  {review.contentType}
                </span>
                <span className="text-[#C4D5E0]" aria-hidden="true">•</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                <StatusBadge status={review.status} size="sm" />
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#20364A] tracking-tight">
                {review.title}
              </h1>

<<<<<<< HEAD
              <p className="mt-1 text-xs sm:text-sm text-[#718494]">
=======
              <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
                    leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" />}
=======
                    leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  >
                    Rewrite Studio
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
<<<<<<< HEAD
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleDownloadReport}
=======
                  leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => toast('Compiling report with evidentiary citations...')}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-6">
<<<<<<< HEAD
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#718494] mb-3">
              Governance Category Breakdown
            </h4>
=======
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#4F6576] mb-3">
              Governance Category Breakdown
            </h2>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const score = review.categoryScores[cat] || 85;
                const isCritical = score < 70;
                return (
<<<<<<< HEAD
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[rgba(65,111,137,.14)] border-[#416F89] shadow-sm' 
                        : 'bg-white border-[#C4D5E0] hover:bg-white'
=======
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`p-3 rounded-lg border text-xs text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      selectedCategory === cat 
                        ? 'bg-[#416F89]/15 border-[#416F89] shadow-sm' 
                        : 'bg-white border-[#C4D5E0] hover:bg-[#F4F8FA]'
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#20364A] truncate pr-1">{cat}</span>
<<<<<<< HEAD
                      <span className={`font-mono font-extrabold ${isCritical ? 'text-[#C65E57]' : 'text-[#416F89]'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-[#D5E3EC] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 90 ? 'bg-[#258A70]' : score >= 75 ? 'bg-[#416F89]' : 'bg-[#C65E57]'
=======
                      <span className={`font-mono font-extrabold ${isCritical ? 'text-[#A94842]' : 'text-[#416F89]'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-[#D5E3EC] h-1.5 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className={`h-full rounded-full ${
                          score >= 90 ? 'bg-[#1F7560]' : score >= 75 ? 'bg-[#416F89]' : 'bg-[#A94842]'
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
<<<<<<< HEAD
                  </div>
=======
                  </button>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
            <h3 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#416F89]" />
              Submitted Content with Highlighted Evidence
            </h3>
            <span className="text-xs text-[#718494] font-bold">
=======
            <h2 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#416F89]" aria-hidden="true" />
              <span>Submitted Content with Highlighted Evidence</span>
            </h2>
            <span className="text-xs text-[#4F6576] font-bold">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              {findings.length} total findings detected
            </span>
          </div>

<<<<<<< HEAD
          <div className="p-5 rounded-lg bg-[rgba(213,227,236,.42)] border border-[#C4D5E0] text-xs sm:text-sm text-[#263B4D] leading-relaxed font-sans space-y-3">
            <p>
              <mark className="bg-[#C65E57]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#C65E57]">
                BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
              </mark>{' '}
              Our <mark className="bg-[rgba(244,215,123,.4)] text-[#20364A] px-1 rounded border-b-2 border-[#B77938]">disruptive miracle platform</mark> revolutionises how your team reviews content. Connect your repository with <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">brand sense Cloud Sync</mark> in one click.
            </p>
            <p>
              Clients typically see an <mark className="bg-[#C65E57]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#C65E57]">instant 450% ROI on their enterprise license in quarter one</mark>. <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!</mark> <mark className="bg-white/80 text-[#20364A] px-1 rounded border-b-2 border-[#718494]">Click the green button on the right side of the screen</mark> to download.
=======
          <div className="p-5 rounded-lg bg-[#D5E3EC]/35 border border-[#C4D5E0] text-xs sm:text-sm text-[#20364A] leading-relaxed font-sans space-y-3">
            <p>
              <mark className="bg-[#A94842]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#A94842]">
                BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
              </mark>{' '}
              Our <mark className="bg-[#F4D77B]/40 text-[#20364A] px-1 rounded border-b-2 border-[#9A682D]">disruptive miracle platform</mark> revolutionises how your team reviews content. Connect your repository with <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">brand sense Cloud Sync</mark> in one click.
            </p>
            <p>
              Clients typically see an <mark className="bg-[#A94842]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#A94842]">instant 450% ROI on their enterprise license in quarter one</mark>. <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!</mark> <mark className="bg-white/80 text-[#20364A] px-1 rounded border-b-2 border-[#4F6576]">Click the green button on the right side of the screen</mark> to download.
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#C4D5E0]">
          <div className="flex flex-wrap items-center gap-2">
<<<<<<< HEAD
            <span className="text-xs font-bold text-[#718494] uppercase tracking-wider">Filter:</span>
=======
            <span className="text-xs font-bold text-[#4F6576] uppercase tracking-wider">Filter:</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
<<<<<<< HEAD
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#263B4D] focus:outline-none focus:ring-1 focus:ring-[#416F89]"
=======
              aria-label="Filter by governance category"
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#20364A] focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
<<<<<<< HEAD
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#263B4D] focus:outline-none focus:ring-1 focus:ring-[#416F89]"
=======
              aria-label="Filter by severity level"
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#20364A] focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Needs Human Review">Needs Human Review</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
<<<<<<< HEAD
            <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, citations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
=======
            <Search className="w-3.5 h-3.5 text-[#4F6576] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, citations..."
              aria-label="Search findings, citations, and evidence"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#416F89]/25 focus:border-[#416F89] text-[#20364A]"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            />
          </div>
        </div>

        {/* Detailed Findings Cards */}
        <div className="space-y-4">
<<<<<<< HEAD
=======
          <h2 className="sr-only">Detailed Audit Findings</h2>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          {filteredFindings.map((finding) => {
            const isEvidenceOpen = expandedEvidence[finding.id];
            const isAccepted = finding.status === 'accepted';
            const isRejected = finding.status === 'rejected';

            return (
              <div
                key={finding.id}
                className={`p-6 rounded-xl border transition-all bg-white shadow-subtle ${
<<<<<<< HEAD
                  isAccepted ? 'border-[#258A70] ring-1 ring-[#258A70]/30' :
=======
                  isAccepted ? 'border-[#1F7560] ring-1 ring-[#1F7560]/30' :
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  isRejected ? 'border-[#C4D5E0] opacity-60' : 'border-[#C4D5E0] hover:border-[#416F89]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C4D5E0]">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={finding.severity} size="sm" />
<<<<<<< HEAD
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5E3EC]/70 text-[#31566D]">
                      {finding.category}
                    </span>
                    <span className="text-[11px] text-[#718494] font-bold">
=======
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC]/70 text-[#20364A]">
                      {finding.category}
                    </span>
                    <span className="text-xs text-[#4F6576] font-bold">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      Confidence: {finding.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted && (
<<<<<<< HEAD
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#258A70] bg-[#258A70]/10 px-2 py-0.5 rounded border border-[#258A70]/20">
                        <Check className="w-3.5 h-3.5" /> Suggestion Accepted
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#718494] bg-[#EDF3F6] px-2 py-0.5 rounded border border-[#C4D5E0]">
                        <X className="w-3.5 h-3.5" /> Rejected
=======
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1F7560] bg-[#1F7560]/10 px-2.5 py-1 rounded-md border border-[#1F7560]/20">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" /> Suggestion Accepted
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4F6576] bg-[#EDF3F6] px-2.5 py-1 rounded-md border border-[#C4D5E0]">
                        <X className="w-3.5 h-3.5" aria-hidden="true" /> Rejected
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#20364A]">
                    {finding.reason}
                  </h3>

                  {/* Flagged quote */}
<<<<<<< HEAD
                  <div className="p-3 bg-[#C65E57]/10 border-l-4 border-[#C65E57] rounded-r-[10px] text-xs text-[#20364A] font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#C65E57] block mb-1">
=======
                  <div className="p-3 bg-[#A94842]/10 border-l-4 border-[#A94842] rounded-r-lg text-xs text-[#20364A] font-mono">
                    <span className="text-xs uppercase font-bold text-[#A94842] block mb-1">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      Flagged Segment:
                    </span>
                    {finding.evidence}
                  </div>

<<<<<<< HEAD
                  <p className="text-xs text-[#718494] leading-relaxed">
=======
                  <p className="text-xs sm:text-sm text-[#4F6576] leading-relaxed">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    {finding.explanation}
                  </p>

                  {/* Suggested Fix */}
<<<<<<< HEAD
                  <div className="p-4 bg-[rgba(65,111,137,.1)] border border-[rgba(65,111,137,.25)] rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-[#20364A] mb-1">
                      <span>Compliant Intent-Preserving Fix</span>
                      <button
=======
                  <div className="p-4 bg-[#416F89]/10 border border-[#416F89]/25 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-[#20364A] mb-1">
                      <span>Compliant Intent-Preserving Fix</span>
                      <button
                        type="button"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        onClick={() => {
                          setEditingFinding(finding);
                          setEditedFix(finding.suggestedFix);
                        }}
<<<<<<< HEAD
                        className="text-[11px] font-bold text-[#416F89] hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
=======
                        className="text-xs font-bold text-[#416F89] hover:underline flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                      >
                        <Edit3 className="w-3 h-3" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        Customize wording
                      </button>
                    </div>

<<<<<<< HEAD
                    <p className="text-xs text-[#20364A] font-semibold italic">
=======
                    <p className="text-xs sm:text-sm text-[#20364A] font-semibold italic">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      {finding.suggestedFix}
                    </p>
                  </div>

                  {/* Expandable Evidence */}
                  <div className="pt-2">
                    <button
<<<<<<< HEAD
                      onClick={() => setExpandedEvidence(prev => ({ ...prev, [finding.id]: !prev[finding.id] }))}
                      className="text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1.5"
                    >
                      {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
=======
                      type="button"
                      onClick={() => setExpandedEvidence(prev => ({ ...prev, [finding.id]: !prev[finding.id] }))}
                      className="text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
                      aria-expanded={isEvidenceOpen}
                    >
                      {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      <span>{isEvidenceOpen ? 'Hide Evidentiary Source' : 'View Evidentiary Citation & Policy Source'}</span>
                    </button>

                    {isEvidenceOpen && (
                      <div className="mt-3 p-4 bg-[#EDF3F6]/70 rounded-lg border border-[#C4D5E0] text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#20364A] flex items-center gap-1.5">
<<<<<<< HEAD
                            <FileText className="w-4 h-4 text-[#416F89]" />
                            {finding.sourceDocument}
                          </span>
                          <button
                            onClick={() => setActiveSourceModal(finding)}
                            className="text-[#416F89] hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" /> Open Document
                          </button>
                        </div>
                        <p className="text-[#718494] text-[11px]">{finding.sourceSection}</p>
=======
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
                        <p className="text-[#4F6576] text-xs">{finding.sourceSection}</p>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
                      leftIcon={<Check className="w-3.5 h-3.5" />}
=======
                      leftIcon={<Check className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => handleAcceptFinding(finding.id)}
                    >
                      Accept Fix
                    </Button>

                    <Button
<<<<<<< HEAD
                      variant={isRejected ? 'danger' : 'outline'}
                      size="sm"
                      leftIcon={<X className="w-3.5 h-3.5" />}
=======
                      variant={isRejected ? 'destructive' : 'outline'}
                      size="sm"
                      leftIcon={<X className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => handleRejectFinding(finding.id)}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
<<<<<<< HEAD
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
=======
                      leftIcon={<Eye className="w-3.5 h-3.5" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      onClick={() => setActiveSourceModal(finding)}
                    >
                      Inspect Source
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
<<<<<<< HEAD
                    leftIcon={<Send className="w-3.5 h-3.5 text-[#416F89]" />}
=======
                    leftIcon={<Send className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
          <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-[#C4D5E0]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#416F89] bg-[#D5E3EC] px-2 py-0.5 rounded">
                    Source Document Verification
                  </span>
                  <h3 className="font-heading text-base font-bold text-[#20364A] mt-1">
                    {activeSourceModal.sourceDocument}
                  </h3>
                </div>
                <button onClick={() => setActiveSourceModal(null)} className="text-[#718494] hover:text-[#20364A]">
=======
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
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  <X className="w-5 h-5" />
                </button>
              </div>

<<<<<<< HEAD
              <div className="my-5 p-5 bg-[#EDF3F6]/60 rounded-lg border border-[#C4D5E0] max-h-80 overflow-y-auto text-xs leading-relaxed text-[#263B4D] font-sans space-y-3">
=======
              <div className="my-5 p-5 bg-[#EDF3F6]/60 rounded-lg border border-[#C4D5E0] max-h-80 overflow-y-auto text-xs sm:text-sm leading-relaxed text-[#20364A] font-sans space-y-3">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                <div className="font-bold text-[#20364A] border-b border-[#C4D5E0] pb-2">
                  {activeSourceModal.sourceSection}
                </div>
                <p>
<<<<<<< HEAD
                  4.2.1 Prohibited Performance Warranties: Marketing materials, digital campaigns, and executive press statements must strictly avoid unqualified absolute terms including but not limited to: "guarantees 100% elimination", "zero regulatory exposure", or "miraculous compliance".
                </p>
                <div className="p-3 bg-[rgba(65,111,137,.1)] rounded-lg border border-[rgba(65,111,137,.25)] text-[#20364A] font-semibold">
                  <strong>Guideline Mandate:</strong> Formulate claims using validated capabilities: "designed to assist in reducing regulatory exposure".
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#C4D5E0] text-xs text-[#718494]">
=======
                  4.2.1 Prohibited Performance Warranties: Marketing materials, digital campaigns, and executive press statements must strictly avoid unqualified absolute terms including but not limited to: &quot;guarantees 100% elimination&quot;, &quot;zero regulatory exposure&quot;, or &quot;miraculous compliance&quot;.
                </p>
                <div className="p-3 bg-[#416F89]/10 rounded-lg border border-[#416F89]/25 text-[#20364A] font-semibold">
                  <strong>Guideline Mandate:</strong> Formulate claims using validated capabilities: &quot;designed to assist in reducing regulatory exposure&quot;.
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#C4D5E0] text-xs text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
          <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
                <h3 className="font-heading text-base font-bold text-[#20364A]">Customize Compliant Suggestion</h3>
                <button onClick={() => setEditingFinding(null)} className="text-[#718494] hover:text-[#20364A]">
=======
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
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 space-y-3">
<<<<<<< HEAD
                <p className="text-xs text-[#718494]">
                  Edit the suggested text while ensuring it still satisfies: <strong>{editingFinding.sourceSection}</strong>
                </p>
                <textarea
                  rows={4}
                  value={editedFix}
                  onChange={(e) => setEditedFix(e.target.value)}
                  className="w-full p-3 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D] font-sans"
=======
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
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
