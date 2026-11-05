'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function AdminReviewsOversightPage() {
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

  return (
    <RoleShell role="Admin" title="Reviews &amp; Pre-Publication Sign-Offs">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Review &amp; Approval Queue</h3>
              <p className="text-xs text-[#4F6576]">Pre-publication submissions routed to Reviewers and Legal Managers</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Submission Title</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Urgency</th>
                  <th className="px-6 py-3.5">Compliance Score</th>
                  <th className="px-6 py-3.5">Decision Status</th>
                  <th className="px-6 py-3.5 text-right">Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading approvals queue...
                    </td>
                  </tr>
                ) : approvals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#4F6576]">
                      No reviews currently pending approval.
                    </td>
                  </tr>
                ) : (
                  approvals.map((appr) => (
                    <tr key={appr.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {appr.title}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {appr.submittedBy?.name || 'Creator'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appr.urgency === 'High' || appr.urgency === 'Urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {appr.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1F7560]">
                        {appr.complianceScore}/100
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#D5E3EC] text-[#20364A]">
                          {appr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-[#4F6576]">
                        {appr.assignedReviewer?.name || 'Legal Compliance'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

