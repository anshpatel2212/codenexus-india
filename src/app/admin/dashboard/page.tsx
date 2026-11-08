'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle2,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  FilePlus2,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/services/api-client';

export default function OrgAdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReviews: 0,
    guidelinesCount: 0,
    approvedFactsCount: 0,
    teamMembersCount: 1,
    pendingApprovals: 0,
    complianceScore: 0,
  });
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      Promise.all([
        apiClient.getReviews(user.organizationId),
        apiClient.getKnowledgeBase(user.organizationId),
        apiClient.getApprovals(user.organizationId),
        apiClient.getUsers(),
      ]).then(([reviews, kb, approvals, users]) => {
        const guidelines = (kb || []).filter((k: any) => k.type === 'guideline').length;
        const facts = (kb || []).filter((k: any) => k.type === 'fact').length;
        const pending = (approvals || []).filter((a: any) => a.status === 'Pending').length;
        
        let avgScore = 0;
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc: number, r: any) => acc + (r.overallScore || 0), 0);
          avgScore = Math.round(sum / reviews.length);
        }

        setStats({
          totalReviews: reviews.length,
          guidelinesCount: guidelines,
          approvedFactsCount: facts,
          teamMembersCount: users.length,
          pendingApprovals: pending,
          complianceScore: avgScore,
        });
        setRecentReviews(reviews.slice(0, 5));
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?.organizationId]);

  return (
    <RoleShell role="Admin" title="Organisation Brand Governance Command Center">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#20364A] via-[#31566D] to-[#416F89] text-white rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4D77B] text-[#20364A]">
                Brand Management Command
              </span>
              <span className="text-xs text-[#D5E3EC]">{user?.organisation || 'Organisation Workspace'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold mt-2 tracking-tight">
              Pre-Publication Brand Control &amp; Quality
            </h2>
            <p className="text-xs text-[#EDF3F6] max-w-xl mt-1 leading-relaxed">
              Curate brand rules, verified corporate facts, and mandatory legal disclaimers enforced across all marketing materials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/brand-guidelines">
              <Button size="sm" className="bg-[#F4D77B] hover:bg-[#F4D77B]/90 text-[#20364A] font-bold">
                Configure Brand Rules
              </Button>
            </Link>
          </div>
        </div>

        {/* High-Level Governance Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Total Reviews</span>
              <FileText className="w-4 h-4 text-[#416F89]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#20364A] mt-2">
              {stats.totalReviews}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">
              {stats.totalReviews === 0 ? 'No reviews submitted yet' : 'Total scans conducted'}
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Active Guidelines</span>
              <BookOpen className="w-4 h-4 text-[#315C74]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#315C74] mt-2">
              {stats.guidelinesCount}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Enforced rules &amp; voice</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Pending Approvals</span>
              <CheckSquare className="w-4 h-4 text-[#B77938]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#B77938] mt-2">
              {stats.pendingApprovals}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">Awaiting human sign-off</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-xs font-bold">Avg Compliance Index</span>
              <TrendingUp className="w-4 h-4 text-[#1F7560]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#1F7560] mt-2">
              {stats.totalReviews > 0 ? `${stats.complianceScore}/100` : '—'}
            </p>
            <p className="text-[11px] text-[#4F6576] mt-0.5">
              {stats.totalReviews > 0 ? 'High Confidence' : 'Zero reviews evaluated'}
            </p>
          </div>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/brand-guidelines"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <BookOpen className="w-5 h-5 text-[#416F89] mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#20364A]">Brand Guidelines</h3>
            <p className="text-xs text-[#4F6576] mt-1">Define voice, tone, and visual standards.</p>
          </Link>

          <Link
            href="/admin/approved-facts"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <CheckCircle2 className="w-5 h-5 text-[#1F7560] mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#20364A]">Approved Facts</h3>
            <p className="text-xs text-[#4F6576] mt-1">Maintain verified statistical and product claims.</p>
          </Link>

          <Link
            href="/admin/terminology"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <ShieldAlert className="w-5 h-5 text-[#A94842] mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#20364A]">Terminology &amp; Banned Terms</h3>
            <p className="text-xs text-[#4F6576] mt-1">Manage blacklisted buzzwords and disclaimers.</p>
          </Link>

          <Link
            href="/admin/team"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <Users className="w-5 h-5 text-[#315C74] mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#20364A]">Users &amp; Access</h3>
            <p className="text-xs text-[#4F6576] mt-1">Invite creators, reviewers, and brand managers.</p>
          </Link>
        </div>

        {/* Recent Reviews Summary */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Recent Content Submissions</h3>
              <p className="text-xs text-[#4F6576]">Pre-publication submissions from creators in your organisation</p>
            </div>
            <Link href="/admin/reviews">
              <Button size="sm" variant="outline">
                All Reviews &amp; Approvals →
              </Button>
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4F6576]">
              <FilePlus2 className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
              <p className="font-bold text-[#20364A]">No Reviews Conducted Yet</p>
              <p className="text-[11px] mt-1 max-w-xs mx-auto">
                Content submissions checked by Creators will appear here with AI confidence and violation reports.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#C4D5E0]">
              {recentReviews.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-[#F4F8FA] transition-colors text-xs">
                  <div>
                    <p className="font-bold text-[#20364A]">{r.title}</p>
                    <p className="text-[11px] text-[#4F6576] mt-0.5">
                      {r.contentType} • Score: {r.overallScore}/100
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#D5E3EC] text-[#20364A]">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}

