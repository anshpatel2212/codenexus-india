'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, Search } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function ReviewerAssignedQueuePage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getApprovals(user.organizationId).then((data) => {
        const pending = (data || []).filter((a: any) => a.status === 'Pending');
        setApprovals(pending);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  const filtered = approvals.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleShell role="Reviewer" title="Assigned Pre-Publication Submissions">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search assigned queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#C4D5E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Submission</th>
                  <th className="px-6 py-3.5">Creator</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Urgency</th>
                  <th className="px-6 py-3.5">AI Score</th>
                  <th className="px-6 py-3.5 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading assigned queue...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#4F6576]">
                      <CheckCircle2 className="w-8 h-8 text-[#1F7560] mx-auto mb-2" />
                      <p className="font-bold text-[#20364A]">No Pending Submissions</p>
                      <p className="text-[11px] mt-1">All submitted content has been evaluated and decided.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {item.submittedBy?.name || 'Creator'}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {item.submittedBy?.department || 'Marketing'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.urgency === 'High' || item.urgency === 'Urgent'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {item.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1F7560]">
                        {item.complianceScore}/100
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/reviewer/review/${item.id}`}>
                          <Button size="sm" variant="primary">
                            Review &amp; Decide →
                          </Button>
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

