'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { ScoreMeter } from '@/components/ui/ScoreMeter';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
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
  ShieldCheck,
  ChevronRight
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

export default function DashboardPage() {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState<string>('All');

  const filteredReviews = filterType === 'All' 
    ? sampleReviews 
    : sampleReviews.filter(r => r.contentType === filterType);

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
              <span className="px-2.5 py-0.5 rounded bg-[rgba(244,215,123,.28)] text-[#9A682D] text-xs font-bold border border-[rgba(183,121,56,.2)]">
                Active Policy
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
              Active Guidelines: <strong className="text-[#20364A]">Acme Core v4.2</strong> • 14 brand rules & 42 verified facts loaded.
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
              <span className="text-xs font-bold text-[#718494]">Total Reviews</span>
              <span className="p-1.5 rounded-lg bg-[rgba(213,227,236,.6)] text-[#31566D]">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">1,420</p>
            <span className="text-[11px] text-[#258A70] font-bold flex items-center gap-1 mt-1">
              ↑ 18% vs last month
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#718494]">Approved Content</span>
              <span className="p-1.5 rounded-lg bg-[rgba(37,138,112,.12)] text-[#258A70]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#258A70] tracking-tight">1,235</p>
            <span className="text-[11px] text-[#718494] mt-1 block">87% overall pass rate</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#718494]">Flagged Issues</span>
              <span className="p-1.5 rounded-lg bg-[rgba(244,215,123,.25)] text-[#B77938]">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#B77938] tracking-tight">142</p>
            <span className="text-[11px] text-[#9A682D] font-bold mt-1 block">Revision suggested</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#718494]">Pending Sign-Off</span>
              <span className="p-1.5 rounded-lg bg-[#D5E3EC]/70 text-[#31566D]">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="mt-2 font-heading text-2xl font-extrabold text-[#31566D] tracking-tight">43</p>
            <span className="text-[11px] text-[#718494] mt-1 block">Awaiting reviewers</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#718494]">Avg Score</span>
              <span className="px-1.5 py-0.5 rounded bg-[#258A70]/10 text-[#258A70] font-extrabold text-[10px]">
                +4.2
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">88.4</span>
              <ScoreMeter score={88} size="sm" showLabel={false} />
            </div>
            <span className="text-[11px] text-[#416F89] font-bold">Tier: High Confidence</span>
          </div>
        </div>

        {/* Middle Section: Chart + Recurring Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-heading text-sm font-bold text-[#20364A]">
                  Compliance Score Trend & Volume Over Time
                </h3>
                <p className="text-xs text-[#718494]">Monthly brand score average vs completed asset reviews</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-[#20364A]">
                  <span className="w-3 h-3 rounded-full bg-[#416F89]" />
                  <span>Score Index</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#718494]">
                  <span className="w-3 h-3 rounded-full bg-[#C4D5E0]" />
                  <span>Reviews Logged</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#416F89" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#416F89" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196,213,224,.5)" />
                  <XAxis dataKey="month" stroke="#718494" fontSize={11} tickLine={false} />
                  <YAxis domain={[60, 100]} stroke="#718494" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#20364A',
                      borderRadius: '10px',
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
          </div>

          {/* Right 4 cols: Frequent Risk Patterns */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-sm font-bold text-[#20364A] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#C65E57]" />
                  Frequent Risk Patterns
                </h3>
                <span className="text-[10px] text-[#718494] font-bold">Past 30 Days</span>
              </div>

              <div className="space-y-3">
                {topViolationsData.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-[#C4D5E0] text-xs">
                    <div className="flex items-center justify-between font-bold text-[#20364A]">
                      <span className="truncate pr-2">{item.issue}</span>
                      <span className="text-[#258A70] font-mono text-[11px]">{item.change}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#718494]">
                      <span>{item.count} detections</span>
                      <span className="text-[#315C74] font-semibold">Mitigated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/insights"
              className="mt-4 pt-3 border-t border-[#C4D5E0] text-xs font-bold text-[#416F89] hover:text-[#315C74] flex items-center justify-between"
            >
              <span>View full governance analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Reviews Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
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
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#D5E3EC]/30 text-[#718494] uppercase tracking-wider text-[10px] font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Review Title & Details</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#20364A] text-xs">{review.title}</div>
                      <div className="text-[11px] text-[#718494] mt-0.5">
                        {review.id} • {review.brandProfile}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-[#D5E3EC]/60 text-[#31566D] font-bold text-[11px]">
                        {review.contentType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.author.avatar}
                          alt={review.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-[#C4D5E0]"
                        />
                        <span className="font-semibold text-[#20364A]">{review.author.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`font-extrabold font-heading text-sm ${
                        review.overallScore >= 90 ? 'text-[#258A70]' :
                        review.overallScore >= 75 ? 'text-[#416F89]' : 'text-[#B77938]'
                      }`}>
                        {review.overallScore}
                      </span>
                      <span className="text-[#718494] text-[10px]">/100</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={review.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
