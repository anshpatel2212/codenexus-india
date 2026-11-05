'use client';

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
  ArrowRight
} from 'lucide-react';
import { 
=======
  ArrowRight,
} from 'lucide-react';
import { 
  sampleReviews, 
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
import { apiClient } from '@/services/api-client';
import { ReviewItem } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiClient.getReviews(user?.organizationId).then((data) => {
      if (active) {
        setReviews(data);
        setLoading(false);
      }
    });
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
    : 88.4;
  const passRate = totalReviewsCount > 0 ? Math.round((approvedCount / totalReviewsCount) * 100) : 87;
=======

export default function DashboardPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('All');

  const filteredReviews = filterType === 'All' 
    ? sampleReviews 
    : sampleReviews.filter(r => r.contentType === filterType);
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

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
<<<<<<< HEAD
              <span className="px-2.5 py-0.5 rounded bg-[rgba(244,215,123,.28)] text-[#9A682D] text-xs font-bold border border-[rgba(183,121,56,.2)]">
                Active Policy
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
              Active Guidelines: <strong className="text-[#20364A]">Acme Core v4.2</strong> • 14 brand rules & 42 verified facts loaded.
=======
              <span className="px-2.5 py-0.5 rounded bg-[#F4D77B]/30 text-[#9A682D] text-xs font-bold border border-[#B77938]/30">
                Active Policy
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Active Guidelines: <strong className="text-[#20364A]">Acme Core v4.2</strong> • 14 brand rules &amp; 42 verified facts loaded.
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
              <span className="text-xs font-bold text-[#718494]">Total Reviews</span>
              <span className="p-1.5 rounded-lg bg-[rgba(213,227,236,.6)] text-[#31566D]">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
              {loading ? '...' : totalReviewsCount > 0 ? totalReviewsCount : '1,420'}
            </p>
            <span className="text-[11px] text-[#258A70] font-bold flex items-center gap-1 mt-1">
=======
              <span className="text-xs font-bold text-[#4F6576]">Total Reviews</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#20364A]" aria-hidden="true">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">1,420</p>
            <span className="text-xs text-[#1F7560] font-bold flex items-center gap-1 mt-1">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              ↑ 18% vs last month
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <span className="text-xs font-bold text-[#718494]">Approved Content</span>
              <span className="p-1.5 rounded-lg bg-[rgba(37,138,112,.12)] text-[#258A70]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#258A70] tracking-tight">
              {loading ? '...' : approvedCount > 0 ? approvedCount : '1,235'}
            </p>
            <span className="text-[11px] text-[#718494] mt-1 block">{passRate}% overall pass rate</span>
=======
              <span className="text-xs font-bold text-[#4F6576]">Approved Content</span>
              <span className="p-1.5 rounded-lg bg-[#1F7560]/12 text-[#1F7560]" aria-hidden="true">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#1F7560] tracking-tight">1,235</p>
            <span className="text-xs text-[#4F6576] mt-1 block">87% overall pass rate</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <span className="text-xs font-bold text-[#718494]">Flagged Issues</span>
              <span className="p-1.5 rounded-lg bg-[rgba(244,215,123,.25)] text-[#B77938]">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#B77938] tracking-tight">
              {loading ? '...' : flaggedCount > 0 ? flaggedCount : '142'}
            </p>
            <span className="text-[11px] text-[#9A682D] font-bold mt-1 block">Revision suggested</span>
=======
              <span className="text-xs font-bold text-[#4F6576]">Flagged Issues</span>
              <span className="p-1.5 rounded-lg bg-[#F4D77B]/25 text-[#9A682D]" aria-hidden="true">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#9A682D] tracking-tight">142</p>
            <span className="text-xs text-[#9A682D] font-bold mt-1 block">Revision suggested</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <span className="text-xs font-bold text-[#718494]">Pending Sign-Off</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#31566D]">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#31566D] tracking-tight">
              {loading ? '...' : pendingCount > 0 ? pendingCount : '43'}
            </p>
            <span className="text-[11px] text-[#718494] mt-1 block">Awaiting reviewers</span>
=======
              <span className="text-xs font-bold text-[#4F6576]">Pending Sign-Off</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#20364A]" aria-hidden="true">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">43</p>
            <span className="text-xs text-[#4F6576] mt-1 block">Awaiting reviewers</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
<<<<<<< HEAD
              <span className="text-xs font-bold text-[#718494]">Avg Score</span>
              <span className="px-1.5 py-0.5 rounded bg-[#258A70]/10 text-[#258A70] font-extrabold text-[10px]">
=======
              <span className="text-xs font-bold text-[#4F6576]">Avg Score</span>
              <span className="px-2 py-0.5 rounded bg-[#1F7560]/10 text-[#1F7560] font-extrabold text-xs">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                +4.2
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
<<<<<<< HEAD
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
                {avgScore}
              </span>
              <ScoreMeter score={Math.round(avgScore)} size="sm" showLabel={false} />
            </div>
            <span className="text-[11px] text-[#416F89] font-bold">Tier: High Confidence</span>
=======
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">88.4</span>
              <ScoreMeter score={88} size="sm" showLabel={false} />
            </div>
            <span className="text-xs text-[#315C74] font-bold">Tier: High Confidence</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          </div>
        </div>

        {/* Middle Section: Chart + Recurring Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
<<<<<<< HEAD
                <h3 className="font-heading text-sm font-bold text-[#20364A]">
                  Compliance Score Trend & Volume Over Time
                </h3>
                <p className="text-xs text-[#718494]">Monthly brand score average vs completed asset reviews</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#20364A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#416F89]" />
                  Average Score
                </span>
=======
                <h2 className="font-heading text-sm font-bold text-[#20364A]">
                  Compliance Score Trend &amp; Volume Over Time
                </h2>
                <p className="text-xs text-[#4F6576]">Monthly brand score average vs completed asset reviews</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[#20364A]">
                  <span className="w-3 h-3 rounded-full bg-[#416F89]" aria-hidden="true" />
                  <span>Score Index</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#4F6576]">
                  <span className="w-3 h-3 rounded-full bg-[#C4D5E0]" aria-hidden="true" />
                  <span>Reviews Logged</span>
                </div>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
<<<<<<< HEAD
                      <stop offset="5%" stopColor="#416F89" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#416F89" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2ECF2" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#718494" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#C4D5E0' }} 
                  />
                  <YAxis 
                    domain={[60, 100]} 
                    stroke="#718494" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#C4D5E0' }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#20364A',
                      borderColor: '#182C3D',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    itemStyle={{ color: '#F4D77B', fontWeight: 600 }}
=======
                      <stop offset="5%" stopColor="#416F89" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#416F89" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196,213,224,.5)" />
                  <XAxis dataKey="month" stroke="#4F6576" fontSize={12} tickLine={false} />
                  <YAxis domain={[60, 100]} stroke="#4F6576" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#20364A',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
          </div>

          {/* Right 4 cols: Frequent Risk Patterns */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
<<<<<<< HEAD
                <h3 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#C65E57]" />
                  Frequent Risk Patterns
                </h3>
                <span className="text-[10px] text-[#718494] font-bold">Past 30 Days</span>
=======
                <h2 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#A94842]" aria-hidden="true" />
                  <span>Frequent Risk Patterns</span>
                </h2>
                <span className="text-xs text-[#4F6576] font-bold">Past 30 Days</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </div>

              <div className="space-y-3">
                {topViolationsData.map((item, idx) => (
<<<<<<< HEAD
                  <div key={idx} className="p-3 rounded-lg bg-white border border-[#C4D5E0] text-xs">
                    <div className="flex items-center justify-between font-bold text-[#20364A]">
                      <span className="truncate pr-2">{item.issue}</span>
                      <span className="text-[#258A70] font-mono text-[11px]">{item.change}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#718494]">
=======
                  <div key={idx} className="p-3 rounded-lg bg-[#F4F8FA] border border-[#C4D5E0] text-xs">
                    <div className="flex items-center justify-between font-bold text-[#20364A]">
                      <span className="truncate pr-2">{item.issue}</span>
                      <span className="text-[#1F7560] font-mono text-xs">{item.change}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      <span>{item.count} detections</span>
                      <span className="text-[#315C74] font-semibold">Mitigated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/insights"
<<<<<<< HEAD
              className="mt-4 pt-3 border-t border-[#C4D5E0] text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center justify-between"
            >
              <span>View full governance analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
=======
              className="mt-4 pt-3 border-t border-[#C4D5E0] text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] rounded"
            >
              <span>View full governance analytics</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            </Link>
          </div>
        </div>

        {/* Recent Reviews Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
<<<<<<< HEAD
              <h3 className="font-heading text-base font-bold text-[#20364A]">Recent Content Reviews</h3>
              <p className="text-xs text-[#718494]">Submissions awaiting sign-off or changes</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#718494] font-bold">Channel:</span>
              <div className="flex gap-1 bg-[#D5E3EC]/50 p-1 rounded-lg text-xs">
                {['All', 'Social Media', 'Press Release', 'Email'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      filterType === tab
                        ? 'bg-white text-[#20364A] shadow-sm'
                        : 'text-[#718494] hover:text-[#20364A]'
=======
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
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
<<<<<<< HEAD
            <table className="w-full text-left text-xs">
              <thead className="bg-[#D5E3EC]/30 text-[#718494] uppercase tracking-wider text-[10px] font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Review Title & Details</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
=======
            <table className="w-full text-left text-xs" aria-label="Recent content reviews table">
              <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Review Title &amp; Details</th>
                  <th scope="col" className="px-6 py-3.5">Channel</th>
                  <th scope="col" className="px-6 py-3.5">Author</th>
                  <th scope="col" className="px-6 py-3.5">Score</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                {filteredReviews.map((review) => (
<<<<<<< HEAD
                  <tr key={review.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#20364A] text-xs">{review.title}</div>
                      <div className="text-[11px] text-[#718494] mt-0.5">
=======
                  <tr key={review.id} className="hover:bg-[#F4F8FA]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#20364A] text-xs sm:text-sm">{review.title}</div>
                      <div className="text-xs text-[#4F6576] mt-0.5">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        {review.id} • {review.brandProfile}
                      </div>
                    </td>

                    <td className="px-6 py-4">
<<<<<<< HEAD
                      <span className="px-2 py-0.5 rounded bg-[#D5E3EC]/60 text-[#31566D] font-bold text-[11px]">
=======
                      <span className="px-2.5 py-1 rounded bg-[#D5E3EC]/70 text-[#20364A] font-bold text-xs">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                        {review.contentType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
<<<<<<< HEAD
                          src={review.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={review.author?.name || 'Author'}
                          className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                        />
                        <span className="font-semibold text-[#20364A]">{review.author?.name || 'Author'}</span>
=======
                          src={review.author.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                        />
                        <span className="font-semibold text-[#20364A]">{review.author.name}</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`font-extrabold font-heading text-sm ${
<<<<<<< HEAD
                        review.overallScore >= 90 ? 'text-[#258A70]' :
                        review.overallScore >= 75 ? 'text-[#416F89]' : 'text-[#B77938]'
                      }`}>
                        {review.overallScore}
                      </span>
                      <span className="text-[#718494] text-[10px]">/100</span>
=======
                        review.overallScore >= 90 ? 'text-[#1F7560]' :
                        review.overallScore >= 75 ? 'text-[#416F89]' : 'text-[#9A682D]'
                      }`}>
                        {review.overallScore}
                      </span>
                      <span className="text-[#4F6576] text-xs">/100</span>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={review.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
<<<<<<< HEAD
                        <Link
                          href={`/review/results`}
                          className="px-2.5 py-1 text-[#20364A] hover:bg-white bg-white border border-[#C4D5E0] rounded-lg font-bold text-[11px] transition-all"
                        >
                          Inspect Findings
                        </Link>
                        <Link
                          href={`/review/rewrite`}
                          className="px-2.5 py-1 text-white bg-[#416F89] hover:bg-[#315C74] rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-[#F4D77B]" />
                          Rewrite Studio
=======
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
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
