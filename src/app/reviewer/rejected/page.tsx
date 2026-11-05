'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, Search, ArrowRight } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function ReviewerRejectedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getApprovals(user.organizationId).then((data) => {
        const rejected = (data || []).filter((a: any) =>
          a.status === 'Rejected' || a.status === 'Needs Revision'
        );
        setItems(rejected);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  return (
    <RoleShell role="Reviewer" title="Rejected &amp; Revision Required Content">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Submissions Returned for Rework</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Content drafts requiring claims substantiation or terminology adjustments.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Submission Title</th>
                  <th className="px-6 py-3.5">Creator</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading rejected submissions...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#4F6576]">
                      <AlertTriangle className="w-8 h-8 text-[#A94842]/40 mx-auto mb-2" />
                      <p className="font-bold text-[#20364A]">No Submissions Marked for Rework</p>
                      <p className="text-[11px] mt-1">Returned drafts will be listed here.</p>
                    </td>
                  </tr>
                ) : (
                  items.map((appr) => (
                    <tr key={appr.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {appr.title}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {appr.submittedBy?.name || 'Creator'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          {appr.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reviewer/review/${appr.id}`}>
                          <Button size="sm" variant="ghost">Re-evaluate</Button>
                        </Link>
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

