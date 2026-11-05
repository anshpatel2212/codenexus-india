'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ShieldCheck,
  RotateCcw,
  FileCheck
} from 'lucide-react';
import { sampleReviews } from '@/data/mock-data';
import { apiClient } from '@/services/api-client';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/auth/AuthProvider';

export default function HistoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const defaultVersions = [
    {
      versionNumber: 3,
      date: 'Nov 03, 2026 • 11:45 AM',
      author: 'Marcus Vance (Copywriter)',
      reviewer: 'Sarah Chen, Esq. (Legal)',
      complianceScore: 94,
      status: 'Ready for Final Sign-Off',
      summary: 'Replaced absolute warranties with qualified risk-mitigation terms; added 2025 cohort study footnote.',
      acceptedCount: 4,
      rejectedCount: 1,
      content: `BrandSense is designed to help reduce regulatory risk and streamline compliance reviews. Our enterprise content governance platform streamlines how your team reviews content. Connect your repository with BrandSense Content Hub™ in one click.

Clients achieve measurable workflow acceleration (*Results based on a 2025 cohort study of 42 enterprise accounts; individual outcomes vary). Equip your marketing and compliance teams with proactive governance today. Select the ‘Download Report’ button below to get started.`,
    },
    {
      versionNumber: 2,
      date: 'Nov 03, 2026 • 10:15 AM',
      author: 'Marcus Vance (Copywriter)',
      reviewer: 'SENSA Intelligence Engine',
      complianceScore: 78,
      status: 'Changes Requested',
      summary: 'Accepted trademark and banned buzzword replacements. Flagged for legal review on ROI claims.',
      acceptedCount: 2,
      rejectedCount: 0,
      content: `BrandSense guarantees a 100% elimination of all regulatory compliance fines within 30 days. Our enterprise content governance platform streamlines how your team reviews content. Connect your repository with BrandSense Content Hub™ in one click.

Clients typically see an instant 450% ROI on their enterprise license in quarter one. Don’t be a dinosaur! Equip your marketing and compliance teams with proactive governance today. Click the green button on the right side of the screen to download.`,
    },
    {
      versionNumber: 1,
      date: 'Nov 03, 2026 • 09:30 AM',
      author: 'Marcus Vance (Copywriter)',
      reviewer: 'Initial Draft Upload',
      complianceScore: 62,
      status: 'Initial Ingestion',
      summary: 'Raw draft ingested from agency creative doc.',
      acceptedCount: 0,
      rejectedCount: 0,
      content: sampleReviews[0].originalContent,
    },
  ];

  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    // Check active review from localStorage first
    let localReview: any = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('brandsense_current_review');
        if (stored) {
          localReview = JSON.parse(stored);
        }
      } catch {}
    }

    apiClient.getReviews(user?.organizationId).then(async (reviews) => {
      if (!active) return;
      const current = localReview || (reviews.length > 0 ? reviews[0] : null);

      if (current) {
        setReview(current);
        const dbRevisions = await apiClient.getRevisions(current.id);
        if (active && dbRevisions && dbRevisions.length > 0) {
          setVersions(dbRevisions);
          setSelectedVersion(dbRevisions[0].versionNumber);
        } else {
          const v1 = {
            versionNumber: 1,
            date: current.submittedAt ? new Date(current.submittedAt).toLocaleString() : 'Just now',
            author: current.authorName || 'Current User',
            reviewer: 'BrandSense AI Review',
            complianceScore: current.overallScore || 85,
            status: current.status || 'Analyzed',
            summary: `Initial brand audit completed with ${current.findings?.length || 0} findings detected.`,
            acceptedCount: current.findings?.length || 0,
            rejectedCount: 0,
            content: current.originalContent || current.text || '',
          };
          setVersions([v1]);
          setSelectedVersion(1);
        }
        setLoading(false);
      } else if (user?.organizationId === 'org-1' || !user?.organizationId) {
        // Fallback for demo org
        setReview(sampleReviews[0]);
        setVersions(defaultVersions);
        setSelectedVersion(3);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const handleRestoreVersion = async (v: typeof defaultVersions[0]) => {
    const nextVer = Math.max(...versions.map((ver) => ver.versionNumber)) + 1;
    const restoredRecord = {
      versionNumber: nextVer,
      date: 'Just now',
      author: `${user?.name || 'Authorized Member'} (${user?.role || 'Creator'})`,
      reviewer: 'Rollback Ingestion',
      complianceScore: v.complianceScore,
      status: 'Restored Version',
      summary: `Restored snapshot from Version ${v.versionNumber}.0 per editorial review.`,
      acceptedCount: v.acceptedCount,
      rejectedCount: v.rejectedCount,
      content: v.content,
    };

    setVersions([restoredRecord, ...versions]);
    setSelectedVersion(nextVer);

    await apiClient.saveRevision({
      reviewId: review.id,
      orgId: user?.organizationId || 'org-1',
      versionNumber: nextVer,
      authorId: user?.id,
      complianceScore: v.complianceScore,
      status: 'Restored Version',
      summary: `Restored snapshot from Version ${v.versionNumber}.0`,
      content: v.content,
      acceptedCount: v.acceptedCount,
      rejectedCount: v.rejectedCount,
    });

    toast(`Restored Version ${v.versionNumber}.0 as new Revision ${nextVer}.0 (Audit trail preserved)`);
  };

  if (!review && !loading) {
    return (
      <AppLayout>
        <div className="bg-white rounded-xl border border-[#C4D5E0] p-12 text-center max-w-xl mx-auto mt-8 shadow-subtle">
          <FileCheck className="w-12 h-12 text-[#416F89]/40 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-heading font-extrabold text-[#20364A]">No Revision History in Workspace</h2>
          <p className="text-xs text-[#4F6576] mt-2 mb-6 leading-relaxed">
            Every AI edit, accepted change, and rollback is tracked with ISO 27001 compliant audit logging once you run a review.
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

  if (!review || versions.length === 0) return null;

  const currentVer = versions.find(v => v.versionNumber === selectedVersion) || versions[0];
  const previousVer = versions.find(v => v.versionNumber === selectedVersion - 1) || versions[versions.length - 1];

  return (
    <AppLayout>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Audit history</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                Revision &amp; Audit History
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold">
                Version Control
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Complete provenance trail of editorial modifications, accepted fixes, and reviewer sign-offs.
            </p>
          </div>

          <Link href="/review/results">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}>
              Back to Active Review
            </Button>
          </Link>
        </div>

        {/* Timeline Selector */}
        <div>
          <h2 className="sr-only">Version Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {versions.map((v) => {
              const isSelected = selectedVersion === v.versionNumber;
              return (
                <button
                  key={v.versionNumber}
                  type="button"
                  onClick={() => setSelectedVersion(v.versionNumber)}
                  aria-pressed={isSelected}
                  className={`text-left p-5 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                    isSelected
                      ? 'bg-white border-[#416F89] ring-2 ring-[#416F89]/20 shadow-[0_15px_45px_rgba(32,54,74,.09)]'
                      : 'bg-white border-[#C4D5E0] hover:border-[#416F89]/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#D5E3EC]/70 text-[#20364A] font-mono">
                      Version {v.versionNumber}.0
                    </span>
                    <span className={`text-xs font-mono font-extrabold ${
                      v.complianceScore >= 90 ? 'text-[#1F7560]' :
                      v.complianceScore >= 75 ? 'text-[#416F89]' : 'text-[#9A682D]'
                    }`}>
                      {v.complianceScore}% Score
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-[#20364A] line-clamp-1">{v.status}</p>
                  <p className="text-xs text-[#4F6576] mt-1 line-clamp-2 leading-relaxed">{v.summary}</p>

                  <div className="mt-4 pt-3 border-t border-[#C4D5E0] flex items-center justify-between text-xs text-[#4F6576]">
                    <span>{v.date}</span>
                    <span className="font-bold text-[#416F89]">
                      {v.acceptedCount} fixes applied
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 bg-[#EDF3F6]/60 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <h2 className="font-bold text-[#20364A] inline">
                Comparing Version {currentVer.versionNumber}.0
              </h2>{' '}
              <span className="text-[#4F6576]">with Version {previousVer.versionNumber}.0</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#1F7560]">
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> {currentVer.acceptedCount} Accepted Fixes
              </span>
              <span className="flex items-center gap-1.5 text-[#4F6576]">
                <X className="w-3.5 h-3.5" aria-hidden="true" /> {currentVer.rejectedCount} Rejected
              </span>
              <button
                type="button"
                onClick={() => handleRestoreVersion(currentVer)}
                className="px-2.5 py-1 bg-white hover:bg-[#EDF3F6] border border-[#C4D5E0] text-[#20364A] rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
              >
                <RotateCcw className="w-3 h-3 text-[#416F89]" aria-hidden="true" />
                Restore as New Revision
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#C4D5E0]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3 text-xs text-[#4F6576]">
                <h3 className="font-bold text-[#20364A] text-xs sm:text-sm">
                  Version {previousVer.versionNumber}.0 (Prior State)
                </h3>
                <span>{previousVer.date}</span>
              </div>
              <div className="p-4 bg-[#EDF3F6]/50 rounded-lg border border-[#C4D5E0] text-xs sm:text-sm text-[#4F6576] leading-relaxed font-sans whitespace-pre-wrap">
                {previousVer.content}
              </div>
            </div>

            <div className="p-6 bg-[#416F89]/5">
              <div className="flex items-center justify-between mb-3 text-xs text-[#4F6576]">
                <h3 className="font-bold text-[#315C74] text-xs sm:text-sm">
                  Version {currentVer.versionNumber}.0 (Selected Revision)
                </h3>
                <span>{currentVer.date}</span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-[#416F89]/40 text-xs sm:text-sm text-[#20364A] leading-relaxed font-sans whitespace-pre-wrap shadow-sm">
                {currentVer.content}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#EDF3F6]/60 border-t border-[#C4D5E0] text-xs text-[#4F6576] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1F7560]" aria-hidden="true" />
              <span>Immutable Audit Trail: All version transitions logged per ISO 27001 requirements.</span>
            </div>
            <span className="font-mono text-xs text-[#4F6576]">Review ID: {review.id}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
