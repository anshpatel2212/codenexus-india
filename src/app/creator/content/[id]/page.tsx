'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Check,
  RotateCcw,
  BookOpen,
  Send,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { ReviewItem, Finding } from '@/types';

export default function CreatorContentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const reviewId = params?.id as string;

  const [review, setReview] = useState<ReviewItem | null>(null);
  const [activeContent, setActiveContent] = useState('');
  const [acceptedFixes, setAcceptedFixes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reviewId) {
      apiClient.getReview(reviewId).then((data: any) => {
        if (data) {
          setReview(data);
          setActiveContent(data.originalContent);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [reviewId]);

  const handleApplyFix = (finding: Finding) => {
    if (!finding.suggestedFix) return;
    // Replace highlighted or problematic text with suggested fix
    let updated = activeContent;
    if (finding.highlightedText && updated.includes(finding.highlightedText)) {
      updated = updated.replace(finding.highlightedText, finding.suggestedFix);
    } else {
      updated += `\n\n[Correction]: ${finding.suggestedFix}`;
    }
    setActiveContent(updated);
    setAcceptedFixes((prev) => ({ ...prev, [finding.id]: true }));
    toast(`Adopted fix for "${finding.category}".`);
  };

  const handleSubmitForSignoff = async () => {
    toast('Draft submitted to Legal and Brand Review queue for approval!');
    router.push('/creator/my-content');
  };

  if (loading) {
    return (
      <RoleShell role="Creator" title="Content Review &amp; Findings">
        <div className="p-12 text-center text-xs text-[#4F6576]">Loading review details...</div>
      </RoleShell>
    );
  }

  if (!review) {
    return (
      <RoleShell role="Creator" title="Review Not Found">
        <div className="p-12 text-center text-xs text-[#4F6576]">
          <p className="font-bold text-[#20364A]">Review Not Found</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/creator/my-content')}>
            Back to My Content
          </Button>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell role="Creator" title={`Review: ${review.title}`}>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push('/creator/my-content')}
              className="flex items-center gap-1.5 text-xs text-[#4F6576] hover:text-[#20364A] mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Content
            </button>
            <h2 className="font-heading font-extrabold text-base text-[#20364A]">{review.title}</h2>
            <p className="text-xs text-[#4F6576] mt-0.5">
              Channel: {review.contentType} • Overall Governance Score: <span className="font-bold text-[#416F89]">{review.overallScore}/100</span>
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitForSignoff}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Final Sign-Off
          </Button>
        </div>

        {/* 2 Column: Editor / Content Left, AI Findings Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Content Workspace */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#C4D5E0] pb-3">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#20364A]">
                Editable Content Draft
              </span>
              <span className="text-[11px] text-[#4F6576]">Preserving Creator Intent</span>
            </div>

            <textarea
              rows={12}
              value={activeContent}
              onChange={(e) => setActiveContent(e.target.value)}
              className="w-full p-4 border border-[#C4D5E0] rounded-xl text-xs font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />

            <div className="flex justify-between items-center text-xs text-[#4F6576]">
              <span>Word count: {activeContent.split(/\s+/).filter(Boolean).length}</span>
              <Button size="sm" variant="outline" onClick={() => setActiveContent(review.originalContent)}>
                Reset to Original
              </Button>
            </div>
          </div>

          {/* Right 5 cols: AI Findings & Citations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#C4D5E0] shadow-subtle">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#20364A] mb-1">
                Detected Infractions &amp; Evidence ({(review.findings || []).length})
              </h3>
              <p className="text-[11px] text-[#4F6576]">Review citations and apply recommended compliant corrections.</p>
            </div>

            {(review.findings || []).length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-[#C4D5E0] text-center text-xs text-[#1F7560]">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">100% On-Brand</p>
                <p className="text-[11px] text-[#4F6576] mt-1">Zero policy violations or unverified claims detected.</p>
              </div>
            ) : (
              (review.findings || []).map((finding) => (
                <div key={finding.id} className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                      {finding.category} • {finding.severity}
                    </span>
                    <span className="text-[11px] text-[#4F6576] font-mono">
                      {finding.confidence}% confidence
                    </span>
                  </div>

                  <p className="font-bold text-[#20364A]">{finding.reason}</p>

                  {finding.evidence && (
                    <div className="p-2.5 bg-[#F4F8FA] rounded-md border border-[#C4D5E0] text-[11px]">
                      <span className="font-bold text-[#4F6576] block mb-0.5">Policy Evidence Citation:</span>
                      <p className="text-[#20364A] italic">{finding.evidence}</p>
                    </div>
                  )}

                  {finding.suggestedFix && (
                    <div className="p-2.5 bg-emerald-50 rounded-md border border-emerald-200 text-[11px]">
                      <span className="font-bold text-emerald-800 block mb-0.5">Suggested Compliant Fix:</span>
                      <p className="text-emerald-950 font-medium">{finding.suggestedFix}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      variant={acceptedFixes[finding.id] ? 'outline' : 'primary'}
                      onClick={() => handleApplyFix(finding)}
                      leftIcon={acceptedFixes[finding.id] ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5" />}
                    >
                      {acceptedFixes[finding.id] ? 'Applied' : 'Apply AI Fix'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
