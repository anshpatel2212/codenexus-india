'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  FilePlus2,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function CreatorMyContentPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = reviews.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleShell role="Creator" title="My Content Submissions &amp; Drafts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search my content drafts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#C4D5E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
          </div>

          <Link href="/creator/new-review">
            <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-4 h-4" />}>
              Create New Review
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Issues Found</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading your content drafts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#4F6576]">
                      <FilePlus2 className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
                      <p className="font-bold text-[#20364A]">No drafts found</p>
                      <p className="text-[11px] mt-1 mb-4">Start by running your first pre-publication brand check.</p>
                      <Link href="/creator/new-review">
                        <Button variant="primary" size="sm">
                          New Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {item.contentType}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#416F89]">
                        {item.overallScore}/100
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#A94842]">
                          {(item.findings || []).length} flagged
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.status === 'Changes Requested' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/creator/content/${item.id}`}>
                          <Button size="sm" variant="ghost">Inspect &amp; Fix →</Button>
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

