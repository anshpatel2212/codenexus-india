'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Send,
  ShieldCheck,
  FileText,
  Clock,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { ApprovalItem, ReviewItem } from '@/types';

export default function ReviewerDecisionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const approvalId = params?.id as string;

  const [approval, setApproval] = useState<ApprovalItem | null>(null);
  const [review, setReview] = useState<ReviewItem | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeciding, setIsDeciding] = useState(false);

  useEffect(() => {
    if (user?.organizationId && approvalId) {
      apiClient.getApprovals(user.organizationId).then(async (approvals) => {
        const target = (approvals || []).find((a: any) => a.id === approvalId);
        if (target) {
          setApproval(target);
          if (target.reviewId) {
            const revData = await apiClient.getReview(target.reviewId);
            setReview(revData || null);
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user?.organizationId, approvalId]);

  const handleDecision = async (status: 'Approved' | 'Rejected' | 'Needs Revision') => {
    if (!approval) return;
    setIsDeciding(true);
    try {
      await apiClient.updateApprovalStatus(approval.id, status, approval.reviewId);
      toast(`Publication Decision Recorded: Content marked as "${status}".`);
      router.push(status === 'Approved' ? '/reviewer/approved' : '/reviewer/rejected');
    } catch {
      toast('Failed to record decision.', 'error');
    } finally {
      setIsDeciding(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      author: {
        name: user?.name || 'Reviewer',
        avatar: user?.avatar || '',
        role: user?.role || 'Reviewer',
      },
      timestamp: 'Just now',
      text: commentText.trim(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    toast('Compliance comment appended to review audit.');
  };

  if (loading) {
    return (
      <RoleShell role="Reviewer" title="Review Decision">
        <div className="p-12 text-center text-xs text-[#4F6576]">Loading submission details...</div>
      </RoleShell>
    );
  }

  if (!approval) {
    return (
      <RoleShell role="Reviewer" title="Submission Not Found">
        <div className="p-12 text-center text-xs text-[#4F6576]">
          <p className="font-bold text-[#20364A]">Approval Record Not Found</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => router.push('/reviewer/assigned')}>
            Back to Queue
          </Button>
        </div>
      </RoleShell>
    );
  }

  return (
    <RoleShell role="Reviewer" title={`Decision: ${approval.title}`}>
      <div className="space-y-6">
        {/* Header Bar with Action Controls */}
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push('/reviewer/assigned')}
              className="flex items-center gap-1.5 text-xs text-[#4F6576] hover:text-[#20364A] mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Queue
            </button>
            <h2 className="font-heading font-extrabold text-base text-[#20364A]">{approval.title}</h2>
            <p className="text-xs text-[#4F6576] mt-0.5">
              Creator: <span className="font-bold text-[#20364A]">{approval.submittedBy?.name}</span> ({approval.submittedBy?.department}) • Compliance Score: <span className="font-bold text-[#1F7560]">{approval.complianceScore}/100</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeciding}
              onClick={() => handleDecision('Needs Revision')}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Request Changes
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={isDeciding}
              onClick={() => handleDecision('Rejected')}
              leftIcon={<XCircle className="w-3.5 h-3.5 text-red-600" />}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isDeciding}
              onClick={() => handleDecision('Approved')}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Approve for Publication
            </Button>
          </div>
        </div>

        {/* 2 Columns: Content & AI Audit Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Content Body */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#C4D5E0] pb-3">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-[#20364A]">
                Submitted Content Copy
              </span>
              <span className="text-[11px] text-[#4F6576]">{approval.contentType}</span>
            </div>

            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0] text-xs leading-relaxed text-[#20364A] whitespace-pre-wrap font-sans">
              {review?.suggestedContent || review?.originalContent || 'No content preview available for this draft.'}
            </div>

            {/* Internal Reviewer Comments Thread */}
            <div className="pt-4 border-t border-[#C4D5E0] space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#20364A]">
                Internal Compliance Commentary ({comments.length})
              </h4>

              {comments.map((c, i) => (
                <div key={i} className="p-3 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#20364A]">
                    <span>{c.author?.name} ({c.author?.role})</span>
                    <span className="text-[10px] text-[#4F6576]">{c.timestamp}</span>
                  </div>
                  <p className="text-[#4F6576]">{c.text}</p>
                </div>
              ))}

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add compliance notes or revision instructions for creator..."
                  className="flex-1 px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                />
                <Button type="submit" size="sm" variant="outline" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Comment
                </Button>
              </form>
            </div>
          </div>

          {/* Right 5 cols: AI Findings & Citations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#C4D5E0] shadow-subtle">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#20364A] mb-1">
                AI Rule Citations &amp; Evidence ({(review?.findings || []).length})
              </h3>
              <p className="text-[11px] text-[#4F6576]">Review regulatory citations before signing off.</p>
            </div>

            {(review?.findings || []).length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-[#C4D5E0] text-center text-xs text-[#1F7560]">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#1F7560]" />
                <p className="font-bold text-[#20364A]">Zero Policy Infractions</p>
                <p className="text-[11px] text-[#4F6576] mt-1">This content meets all brand standards and fact claims.</p>
              </div>
            ) : (
              (review?.findings || []).map((finding) => (
                <div key={finding.id} className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                      {finding.category} • {finding.severity}
                    </span>
                    <span className="text-[10px] text-[#4F6576] font-mono">{finding.confidence}% confidence</span>
                  </div>

                  <p className="font-bold text-[#20364A]">{finding.reason}</p>

                  {finding.evidence && (
                    <div className="p-2.5 bg-[#F4F8FA] rounded-md border border-[#C4D5E0] text-[11px]">
                      <span className="font-bold text-[#4F6576] block mb-0.5">Brand Guideline Citation:</span>
                      <p className="text-[#20364A] italic">{finding.evidence}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
