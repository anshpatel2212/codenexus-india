'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  History,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getReviews(user.organizationId).then((data) => {
        // Filter reviews created by this creator or in this workspace
        setReviews(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const approvedCount = reviews.filter((r) => r.status === 'Approved').length;
  const changesRequestedCount = reviews.filter((r) => r.status === 'Changes Requested' || r.status === 'Needs Revision').length;
  const pendingCount = reviews.filter((r) => r.status === 'Pending Review' || r.status === 'In Progress').length;

  return (
    <RoleShell role="Creator" title="Content Creator Pre-Publication Studio">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#20364A] via-[#31566D] to-[#416F89] text-white rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4D77B] text-[#20364A]">
                Creator Studio
              </span>
              <span className="text-xs text-[#D5E3EC]">Welcome, {user?.name || 'Creator'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold mt-2 tracking-tight">
              AI Brand Governance &amp; Draft Verification
            </h2>
            <p className="text-xs text-[#EDF3F6] max-w-xl mt-1 leading-relaxed">
              Verify your marketing copy against official guidelines, resolve tone issues, and ensure all factual claims are substantiated before publishing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/creator/new-review">
              <Button size="sm" className="bg-[#F4D77B] hover:bg-[#F4D77B]/90 text-[#20364A] font-bold" leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}>
                Run New AI Review
              </Button>
            </Link>
          </div>
        </div>

        {/* Creator Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">My Submissions</span>
              <FileText className="w-4 h-4 text-[#416F89]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#20364A] mt-2">
              {reviews.length}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Total drafts evaluated</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Approved to Publish</span>
              <CheckCircle2 className="w-4 h-4 text-[#1F7560]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#1F7560] mt-2">
              {approvedCount}
            </p>
            <p className="text-[11px] text-[#1F7560] font-bold mt-0.5">Signed off by Legal / Brand</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Pending Approval</span>
              <Clock className="w-4 h-4 text-[#B77938]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#B77938] mt-2">
              {pendingCount}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">In reviewer queue</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Needs Revision</span>
              <AlertTriangle className="w-4 h-4 text-[#A94842]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#A94842] mt-2">
              {changesRequestedCount}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Action required on findings</p>
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/creator/new-review"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <FilePlus2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">Scan New Content</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              Paste LinkedIn posts, ad copy, emails, or blog drafts for instant AI policy review.
            </p>
          </Link>

          <Link
            href="/creator/my-content"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">My Content Drafts</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              View your pending drafts, inspect AI suggestions, and adopt one-click copy fixes.
            </p>
          </Link>

          <Link
            href="/assistant"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">Ask SENSA AI</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              Chat directly with SENSA to verify claims or ask questions about brand guidelines.
            </p>
          </Link>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">My Recent Submissions</h3>
              <p className="text-xs text-[#4F6576]">Drafts evaluated for brand compliance</p>
            </div>
            <Link href="/creator/my-content">
              <Button size="sm" variant="outline">
                All My Content →
              </Button>
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">
              <FilePlus2 className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Content Submitted Yet</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto mb-4">
                Paste your first marketing draft above to get instant AI recommendations and evidence citations.
              </p>
              <Link href="/creator/new-review">
                <Button variant="primary" size="sm">
                  Run First Review
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#C4D5E0]">
              {reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-[#F4F8FA] transition-colors text-xs">
                  <div>
                    <p className="font-bold text-[#20364A]">{r.title}</p>
                    <p className="text-[11px] text-[#4F6576] mt-0.5">
                      {r.contentType} • Overall Score: {r.overallScore}/100
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      r.status === 'Changes Requested' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {r.status}
                    </span>
                    <Link href={`/creator/content/${r.id}`}>
                      <Button size="sm" variant="ghost">View Fixes →</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}

