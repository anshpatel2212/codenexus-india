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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEvidence, setExpandedEvidence] = useState<{ [id: string]: boolean }>({ 'f-1': true });
  const [activeSourceModal, setActiveSourceModal] = useState<Finding | null>(null);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [editedFix, setEditedFix] = useState('');

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
                <span className="text-xs font-mono text-[#718494] font-bold">{review.id}</span>
                <span className="text-[#C4D5E0]">•</span>
                <span className="px-2 py-0.5 rounded bg-[#D5E3EC]/70 text-[#31566D] font-bold text-xs">
                  {review.contentType}
                </span>
                <span className="text-[#C4D5E0]">•</span>
                <StatusBadge status={review.status} size="sm" />
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#20364A] tracking-tight">
                {review.title}
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-[#718494]">
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
                    leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" />}
                  >
                    Rewrite Studio
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#718494] mb-3">
              Governance Category Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => {
                const score = review.categoryScores[cat] || 85;
                const isCritical = score < 70;
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedCategory === cat 
                        ? 'bg-[rgba(65,111,137,.14)] border-[#416F89] shadow-sm' 
                        : 'bg-white border-[#C4D5E0] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#20364A] truncate pr-1">{cat}</span>
                      <span className={`font-mono font-extrabold ${isCritical ? 'text-[#C65E57]' : 'text-[#416F89]'}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-[#D5E3EC] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score >= 90 ? 'bg-[#258A70]' : score >= 75 ? 'bg-[#416F89]' : 'bg-[#C65E57]'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#416F89]" />
              Submitted Content with Highlighted Evidence
            </h3>
            <span className="text-xs text-[#718494] font-bold">
              {findings.length} total findings detected
            </span>
          </div>

          <div className="p-5 rounded-lg bg-[rgba(213,227,236,.42)] border border-[#C4D5E0] text-xs sm:text-sm text-[#263B4D] leading-relaxed font-sans space-y-3">
            <p>
              <mark className="bg-[#C65E57]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#C65E57]">
                BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days.
              </mark>{' '}
              Our <mark className="bg-[rgba(244,215,123,.4)] text-[#20364A] px-1 rounded border-b-2 border-[#B77938]">disruptive miracle platform</mark> revolutionises how your team reviews content. Connect your repository with <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">brand sense Cloud Sync</mark> in one click.
            </p>
            <p>
              Clients typically see an <mark className="bg-[#C65E57]/20 text-[#20364A] font-medium px-1 rounded border-b-2 border-[#C65E57]">instant 450% ROI on their enterprise license in quarter one</mark>. <mark className="bg-[#D5E3EC] text-[#20364A] px-1 rounded border-b-2 border-[#416F89]">Don’t be a dinosaur! Grab your license today before your competitors leave you in the dust!</mark> <mark className="bg-white/80 text-[#20364A] px-1 rounded border-b-2 border-[#718494]">Click the green button on the right side of the screen</mark> to download.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#C4D5E0]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#718494] uppercase tracking-wider">Filter:</span>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#263B4D] focus:outline-none focus:ring-1 focus:ring-[#416F89]"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg text-[#263B4D] focus:outline-none focus:ring-1 focus:ring-[#416F89]"
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
            <Search className="w-3.5 h-3.5 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings, citations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C4D5E0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D]"
            />
          </div>
        </div>

        {/* Detailed Findings Cards */}
        <div className="space-y-4">
          {filteredFindings.map((finding) => {
            const isEvidenceOpen = expandedEvidence[finding.id];
            const isAccepted = finding.status === 'accepted';
            const isRejected = finding.status === 'rejected';

            return (
              <div
                key={finding.id}
                className={`p-6 rounded-xl border transition-all bg-white shadow-subtle ${
                  isAccepted ? 'border-[#258A70] ring-1 ring-[#258A70]/30' :
                  isRejected ? 'border-[#C4D5E0] opacity-60' : 'border-[#C4D5E0] hover:border-[#416F89]/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C4D5E0]">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D5E3EC]/70 text-[#31566D]">
                      {finding.category}
                    </span>
                    <span className="text-[11px] text-[#718494] font-bold">
                      Confidence: {finding.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#258A70] bg-[#258A70]/10 px-2 py-0.5 rounded border border-[#258A70]/20">
                        <Check className="w-3.5 h-3.5" /> Suggestion Accepted
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#718494] bg-[#EDF3F6] px-2 py-0.5 rounded border border-[#C4D5E0]">
                        <X className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#20364A]">
                    {finding.reason}
                  </h3>

                  {/* Flagged quote */}
                  <div className="p-3 bg-[#C65E57]/10 border-l-4 border-[#C65E57] rounded-r-[10px] text-xs text-[#20364A] font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#C65E57] block mb-1">
                      Flagged Segment:
                    </span>
                    {finding.evidence}
                  </div>

                  <p className="text-xs text-[#718494] leading-relaxed">
                    {finding.explanation}
                  </p>

                  {/* Suggested Fix */}
                  <div className="p-4 bg-[rgba(65,111,137,.1)] border border-[rgba(65,111,137,.25)] rounded-lg">
                    <div className="flex items-center justify-between text-xs font-bold text-[#20364A] mb-1">
                      <span>Compliant Intent-Preserving Fix</span>
                      <button
                        onClick={() => {
                          setEditingFinding(finding);
                          setEditedFix(finding.suggestedFix);
                        }}
                        className="text-[11px] font-bold text-[#416F89] hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Customize wording
                      </button>
                    </div>

                    <p className="text-xs text-[#20364A] font-semibold italic">
                      {finding.suggestedFix}
                    </p>
                  </div>

                  {/* Expandable Evidence */}
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedEvidence(prev => ({ ...prev, [finding.id]: !prev[finding.id] }))}
                      className="text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center gap-1.5"
                    >
                      {isEvidenceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isEvidenceOpen ? 'Hide Evidentiary Source' : 'View Evidentiary Citation & Policy Source'}</span>
                    </button>

                    {isEvidenceOpen && (
                      <div className="mt-3 p-4 bg-[#EDF3F6]/70 rounded-lg border border-[#C4D5E0] text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#20364A] flex items-center gap-1.5">
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
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => handleAcceptFinding(finding.id)}
                    >
                      Accept Fix
                    </Button>

                    <Button
                      variant={isRejected ? 'danger' : 'outline'}
                      size="sm"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                      onClick={() => handleRejectFinding(finding.id)}
                    >
                      Reject
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setActiveSourceModal(finding)}
                    >
                      Inspect Source
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Send className="w-3.5 h-3.5 text-[#416F89]" />}
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
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 p-5 bg-[#EDF3F6]/60 rounded-lg border border-[#C4D5E0] max-h-80 overflow-y-auto text-xs leading-relaxed text-[#263B4D] font-sans space-y-3">
                <div className="font-bold text-[#20364A] border-b border-[#C4D5E0] pb-2">
                  {activeSourceModal.sourceSection}
                </div>
                <p>
                  4.2.1 Prohibited Performance Warranties: Marketing materials, digital campaigns, and executive press statements must strictly avoid unqualified absolute terms including but not limited to: "guarantees 100% elimination", "zero regulatory exposure", or "miraculous compliance".
                </p>
                <div className="p-3 bg-[rgba(65,111,137,.1)] rounded-lg border border-[rgba(65,111,137,.25)] text-[#20364A] font-semibold">
                  <strong>Guideline Mandate:</strong> Formulate claims using validated capabilities: "designed to assist in reducing regulatory exposure".
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#C4D5E0] text-xs text-[#718494]">
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
          <div className="fixed inset-0 bg-[#20364A]/60  z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-elevated border border-[#C4D5E0] p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#C4D5E0]">
                <h3 className="font-heading text-base font-bold text-[#20364A]">Customize Compliant Suggestion</h3>
                <button onClick={() => setEditingFinding(null)} className="text-[#718494] hover:text-[#20364A]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-4 space-y-3">
                <p className="text-xs text-[#718494]">
                  Edit the suggested text while ensuring it still satisfies: <strong>{editingFinding.sourceSection}</strong>
                </p>
                <textarea
                  rows={4}
                  value={editedFix}
                  onChange={(e) => setEditedFix(e.target.value)}
                  className="w-full p-3 text-xs bg-[#EDF3F6]/50 border border-[#C4D5E0] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#416F89] text-[#263B4D] font-sans"
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
