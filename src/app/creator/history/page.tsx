'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function CreatorHistoryPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      apiClient.getReviews(user.organizationId).then((data) => {
        setReviews(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  return (
    <RoleShell role="Creator" title="Submission History &amp; Decision Audit Log">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Personal Review History</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Chronological record of all draft scans and human reviewer decisions.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle divide-y divide-[#C4D5E0]/70 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">Loading history...</div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">No review history logged yet.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-5 flex items-center justify-between hover:bg-[#F4F8FA] transition-colors text-xs">
                <div>
                  <p className="font-bold text-[#20364A]">{r.title}</p>
                  <p className="text-[11px] text-[#4F6576] mt-0.5">
                    {r.contentType} • Evaluated on {new Date(r.createdAt || Date.now()).toLocaleDateString()}
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
                    <Button size="sm" variant="outline">View Report</Button>
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

