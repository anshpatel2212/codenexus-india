'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function ReviewerDashboardPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getApprovals(user.organizationId).then((data) => {
        setApprovals(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const approvedItems = approvals.filter((a) => a.status === 'Approved');
  const rejectedItems = approvals.filter((a) => a.status === 'Rejected' || a.status === 'Needs Revision');

  return (
    <RoleShell role="Reviewer" title="Reviewer &amp; Compliance Sign-Off Center">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#20364A] via-[#31566D] to-[#416F89] text-white rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4D77B] text-[#20364A]">
                Human Decision Gate
              </span>
              <span className="text-xs text-[#D5E3EC]">Reviewer: {user?.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold mt-2 tracking-tight">
              Pre-Publication Approval Queue
            </h2>
            <p className="text-xs text-[#EDF3F6] max-w-xl mt-1 leading-relaxed">
              Verify AI citations, evaluate detected risk patterns, and execute authoritative human decisions before marketing assets are published.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/reviewer/assigned">
              <Button size="sm" className="bg-[#F4D77B] hover:bg-[#F4D77B]/90 text-[#20364A] font-bold" leftIcon={<Clock className="w-3.5 h-3.5" />}>
                Review Pending Queue ({pendingApprovals.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Assigned to Review</span>
              <Clock className="w-4 h-4 text-[#B77938]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#B77938] mt-2">
              {pendingApprovals.length}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Pending your sign-off</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Approved for Release</span>
              <CheckCircle2 className="w-4 h-4 text-[#1F7560]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#1F7560] mt-2">
              {approvedItems.length}
            </p>
            <p className="text-[11px] text-[#1F7560] font-bold mt-0.5">Approved &amp; cleared</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Changes Requested</span>
              <AlertTriangle className="w-4 h-4 text-[#A94842]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#A94842] mt-2">
              {rejectedItems.length}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Returned to creator</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Avg Review Turnaround</span>
              <TrendingUp className="w-4 h-4 text-[#416F89]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#416F89] mt-2">
              0.5 hrs
            </p>
            <p className="text-[11px] text-[#1F7560] font-bold mt-0.5">Faster than SLA threshold</p>
          </div>
        </div>

        {/* Assigned Submissions Queue Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Pending Submissions Queue</h3>
              <p className="text-xs text-[#4F6576]">Content drafts awaiting regulatory or brand sign-off</p>
            </div>
            <Link href="/reviewer/assigned">
              <Button size="sm" variant="outline">
                All Assigned →
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">Loading approval queue...</div>
          ) : pendingApprovals.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#1F7560]">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#1F7560]" />
              <p className="font-bold text-[#20364A]">All Clear! Queue is Empty</p>
              <p className="text-[11px] text-[#4F6576] mt-1">No pending content reviews requiring human sign-off.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                  <tr>
                    <th className="px-6 py-3.5">Submission Title</th>
                    <th className="px-6 py-3.5">Submitted By</th>
                    <th className="px-6 py-3.5">Urgency</th>
                    <th className="px-6 py-3.5">Score</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C4D5E0]">
                  {pendingApprovals.map((appr) => (
                    <tr key={appr.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {appr.title}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {appr.submittedBy?.name || 'Creator'} ({appr.submittedBy?.department || 'Marketing'})
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appr.urgency === 'High' || appr.urgency === 'Urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {appr.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1F7560]">
                        {appr.complianceScore}/100
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reviewer/review/${appr.id}`}>
                          <Button size="sm" variant="primary">
                            Review &amp; Decide →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}

