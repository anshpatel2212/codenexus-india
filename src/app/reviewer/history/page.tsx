'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function ReviewerHistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getApprovals(user.organizationId).then((data) => {
        setItems(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  return (
    <RoleShell role="Reviewer" title="Reviewer Sign-Off History">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Decisions Audit Trail</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Permanent historical record of human sign-off determinations.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle divide-y divide-[#C4D5E0]/70 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">Loading sign-off history...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">No decisions recorded yet.</div>
          ) : (
            items.map((appr) => (
              <div key={appr.id} className="p-5 flex items-center justify-between hover:bg-[#F4F8FA] transition-colors text-xs">
                <div>
                  <p className="font-bold text-[#20364A]">{appr.title}</p>
                  <p className="text-[11px] text-[#4F6576] mt-0.5">
                    Submitted by {appr.submittedBy?.name || 'Creator'} • Urgency: {appr.urgency}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    appr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    appr.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {appr.status}
                  </span>
                  <Link href={`/reviewer/review/${appr.id}`}>
                    <Button size="sm" variant="outline">Inspect Decision</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleShell>
  );
}

