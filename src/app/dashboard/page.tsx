'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScoreMeter } from '@/components/ui/ScoreMeter';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  FilePlus2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  Download, 
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { 
  sampleReviews, 
  complianceTrendsData, 
  topViolationsData 
} from '@/data/mock-data';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { ReviewItem } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [kbCount, setKbCount] = useState({ rules: 0, facts: 0 });

  useEffect(() => {
    let active = true;
    if (user?.organizationId) {
      apiClient.getReviews(user.organizationId).then((data) => {
        if (active) {
          setReviews(data);
          setLoading(false);
        }
      });
      apiClient.getKnowledgeBase(user.organizationId).then((kb) => {
        if (active) {
          const rules = kb.filter((i) => i.type !== 'fact').length;
          const facts = kb.filter((i) => i.type === 'fact').length;
          setKbCount({ rules, facts });
        }
      });
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const filteredReviews = filterType === 'All' 
    ? reviews 
    : reviews.filter(r => r.contentType === filterType);

  // Compute live governance metrics from reviews
  const totalReviewsCount = reviews.length;
  const approvedCount = reviews.filter(r => r.status === 'Approved').length;
  const flaggedCount = reviews.reduce((acc, r) => acc + (r.findings?.length || 0), 0);
  const pendingCount = reviews.filter(r => r.status === 'Pending Review' || r.status === 'Changes Requested' || r.status === 'Needs Revision').length;
  const avgScore = reviews.length > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + r.overallScore, 0) / reviews.length * 10) / 10 
    : 0;
  const passRate = totalReviewsCount > 0 
    ? Math.round((approvedCount / totalReviewsCount) * 100) 
    : 0;

  // Derive frequent risk patterns from actual reviews
  const frequentPatterns = React.useMemo(() => {
    if (totalReviewsCount === 0) return [];
    const issueMap = new Map<string, number>();
    reviews.forEach((r) => {
      (r.findings || []).forEach((f) => {
        const key = f.category || f.reason || 'General Compliance Violation';
        issueMap.set(key, (issueMap.get(key) || 0) + 1);
      });
    });

    return Array.from(issueMap.entries())
      .map(([issue, count]) => ({
        issue,
        count,
        change: 'Mitigated',
      }))
      .slice(0, 5);
  }, [reviews, totalReviewsCount]);

  const dynamicChartData = React.useMemo(() => {
    if (totalReviewsCount === 0) return [];
    return reviews.slice(-6).map((r) => ({
      month: r.title.length > 10 ? r.title.substring(0, 9) + '…' : r.title,
      score: r.overallScore,
      reviews: 1,
    }));
  }, [reviews, totalReviewsCount]);

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Overview</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                Brand Governance Center
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#F4D77B]/30 text-[#9A682D] text-xs font-bold border border-[#B77938]/30">
                Active Policy
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Active Guidelines: <strong className="text-[#20364A]">{user?.organisation || 'BrandSense Workspace'} Policy</strong> •{' '}
              {kbCount.rules + kbCount.facts > 0
                ? `${kbCount.rules} brand rules & ${kbCount.facts} verified facts loaded.`
                : 'No brand guidelines loaded yet. Add rules in Knowledge Base to begin governance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => toast('Exporting 30-day compliance report (PDF)...')}
            >
              Export Report
            </Button>
            <Link href="/review/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FilePlus2 className="w-4 h-4" />}
              >
                Submit New Review
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 Top Core KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4F6576]">Total Reviews</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#20364A]" aria-hidden="true">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">{loading ? '...' : totalReviewsCount}</p>
            <span className={`text-xs font-bold flex items-center gap-1 mt-1 ${totalReviewsCount > 0 ? 'text-[#1F7560]' : 'text-[#4F6576]'}`}>
              {totalReviewsCount > 0 ? 'Active reviews' : 'No reviews logged yet'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4F6576]">Approved Content</span>
              <span className="p-1.5 rounded-lg bg-[#1F7560]/12 text-[#1F7560]" aria-hidden="true">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#1F7560] tracking-tight">{loading ? '...' : approvedCount}</p>
            <span className="text-xs text-[#4F6576] mt-1 block">{totalReviewsCount > 0 ? `${passRate}% overall pass rate` : 'No reviews logged yet'}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4F6576]">Flagged Issues</span>
              <span className="p-1.5 rounded-lg bg-[#F4D77B]/25 text-[#9A682D]" aria-hidden="true">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#9A682D] tracking-tight">{loading ? '...' : flaggedCount}</p>
            <span className="text-xs text-[#9A682D] font-bold mt-1 block">{flaggedCount > 0 ? 'Revisions suggested' : 'Zero issues pending'}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4F6576]">Pending Sign-Off</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#20364A]" aria-hidden="true">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">{loading ? '...' : pendingCount}</p>
            <span className="text-xs text-[#4F6576] mt-1 block">{pendingCount > 0 ? 'Awaiting reviewers' : 'All clear'}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4F6576]">Avg Score</span>
              {totalReviewsCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-[#1F7560]/10 text-[#1F7560] font-extrabold text-xs">
                  {avgScore >= 90 ? 'Grade A' : 'In Review'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
                {totalReviewsCount > 0 ? avgScore : '—'}
              </span>
              <ScoreMeter score={totalReviewsCount > 0 ? Math.round(avgScore) : 0} size="sm" showLabel={false} />
            </div>
            <span className="text-xs text-[#315C74] font-bold">
              {totalReviewsCount > 0 ? (avgScore >= 85 ? 'Tier: High Confidence' : 'Tier: Moderate') : 'Awaiting First Review'}
            </span>
          </div>
        </div>

        {/* Middle Section: Chart + Recurring Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-heading text-sm font-bold text-[#20364A]">
                  Compliance Score Trend &amp; Volume Over Time
                </h2>
                <p className="text-xs text-[#4F6576]">
                  {totalReviewsCount > 0
                    ? 'Compliance score index and volume across your recent reviews'
                    : 'Real-time telemetry generated upon review submissions'}
                </p>
              </div>

              {totalReviewsCount > 0 && (
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-[#20364A]">
                    <span className="w-3 h-3 rounded-full bg-[#416F89]" aria-hidden="true" />
                    <span>Score Index</span>
                  </div>
                </div>
              )}
            </div>

            {totalReviewsCount === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-[#C4D5E0] rounded-xl bg-[#F4F8FA]/60 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#D5E3EC]/70 flex items-center justify-center text-[#416F89] mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#20364A]">No Review Data Yet</h3>
                <p className="text-xs text-[#4F6576] max-w-sm mt-1 mb-4 leading-relaxed">
                  Submit your first copy or marketing draft to see real-time compliance score indices and review volumes plotted over time.
                </p>
                <Link href="/review/new">
                  <Button variant="primary" size="sm" leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}>
                    Submit First Review
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#416F89" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#416F89" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196,213,224,.5)" />
                    <XAxis dataKey="month" stroke="#4F6576" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#4F6576" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#20364A',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#416F89"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#scoreGrad)"
                      name="Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right 4 cols: Frequent Risk Patterns */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#A94842]" aria-hidden="true" />
                  <span>Frequent Risk Patterns</span>
                </h2>
                <span className="text-xs text-[#4F6576] font-bold">Past 30 Days</span>
              </div>

              {totalReviewsCount === 0 || frequentPatterns.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#4F6576]">
                  <ShieldAlert className="w-8 h-8 text-[#416F89]/40 mx-auto mb-2" />
                  <p className="font-bold text-[#20364A]">No Risk Patterns Detected</p>
                  <p className="text-[11px] mt-1 text-[#4F6576] max-w-[220px] mx-auto leading-relaxed">
                    Recurring brand policy violations, hyperbolic words, and unverified claims will appear here once content is submitted.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {frequentPatterns.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#F4F8FA] border border-[#C4D5E0] text-xs">
                      <div className="flex items-center justify-between font-bold text-[#20364A]">
                        <span className="truncate pr-2">{item.issue}</span>
                        <span className="text-[#1F7560] font-mono text-xs">{item.change}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-[#4F6576]">
                        <span>{item.count} {item.count === 1 ? 'detection' : 'detections'}</span>
                        <span className="text-[#315C74] font-semibold">Tracked</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/insights"
              className="mt-4 pt-3 border-t border-[#C4D5E0] text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
            >
              <span>View full governance analytics</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Recent Reviews Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-base font-bold text-[#20364A]">Recent Content Reviews</h2>
              <p className="text-xs text-[#4F6576]">Submissions awaiting sign-off or changes</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#4F6576] font-bold" id="channel-filter-label">Channel:</span>
              <div className="flex gap-1 bg-[#D5E3EC]/60 p-1 rounded-lg text-xs" role="toolbar" aria-labelledby="channel-filter-label">
                {['All', 'Social Media', 'Press Release', 'Email'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterType(tab)}
                    aria-pressed={filterType === tab}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] ${
                      filterType === tab
                        ? 'bg-white text-[#20364A] shadow-sm'
                        : 'text-[#4F6576] hover:text-[#20364A]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Recent content reviews table">
              <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Review Title &amp; Details</th>
                  <th scope="col" className="px-6 py-3.5">Channel</th>
                  <th scope="col" className="px-6 py-3.5">Author</th>
                  <th scope="col" className="px-6 py-3.5">Score</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                {filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-sm mx-auto">
                        <FilePlus2 className="w-10 h-10 text-[#416F89]/40 mx-auto mb-3" aria-hidden="true" />
                        <p className="text-sm font-bold text-[#20364A]">No reviews yet in this workspace</p>
                        <p className="text-xs text-[#4F6576] mt-1 mb-4">
                          Submit your first piece of marketing copy or campaign document to run an autonomous AI compliance audit.
                        </p>
                        <Link href="/review/new">
                          <Button variant="primary" size="sm">
                            Start New Review →
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#F4F8FA]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#20364A] text-xs sm:text-sm">{review.title}</div>
                      <div className="text-xs text-[#4F6576] mt-0.5">
                        {review.id} • {review.brandProfile}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-[#D5E3EC]/70 text-[#20364A] font-bold text-xs">
                        {review.contentType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                        />
                        <span className="font-semibold text-[#20364A]">{review.author?.name || "Author"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`font-extrabold font-heading text-sm ${
                        review.overallScore >= 90 ? 'text-[#1F7560]' :
                        review.overallScore >= 75 ? 'text-[#416F89]' : 'text-[#9A682D]'
                      }`}>
                        {review.overallScore}
                      </span>
                      <span className="text-[#4F6576] text-xs">/100</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={review.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/review/results`}>
                          <Button variant="outline" size="sm">
                            Inspect Findings
                          </Button>
                        </Link>
                        <Link href={`/review/rewrite`}>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#F4D77B]" aria-hidden="true" />}
                          >
                            Rewrite Studio
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
