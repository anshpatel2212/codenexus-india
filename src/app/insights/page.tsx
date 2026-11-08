'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  HelpCircle
} from 'lucide-react';
import { 
  complianceTrendsData, 
  departmentActivityData 
} from '@/data/mock-data';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function InsightsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalFindingsCount, setTotalFindingsCount] = useState(0);
  const [fixAcceptanceRate, setFixAcceptanceRate] = useState<number | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (user?.organizationId) {
      apiClient.getReviews(user.organizationId).then((revs) => {
        if (!active) return;
        setReviews(revs);
        setLoading(false);

        if (revs.length > 0) {
          let totalFindings = 0;
          let accepted = 0;
          let rejected = 0;
          let scoreSum = 0;

          revs.forEach((r) => {
            scoreSum += r.overallScore || 0;
            (r.findings || []).forEach((f: any) => {
              totalFindings++;
              if (f.status === 'accepted') accepted++;
              if (f.status === 'rejected') rejected++;
            });
          });

          setTotalFindingsCount(totalFindings);
          setAvgScore(Math.round((scoreSum / revs.length) * 10) / 10);
          const totalDecided = accepted + rejected;
          if (totalDecided > 0) {
            setFixAcceptanceRate(Math.round((accepted / totalDecided) * 1000) / 10);
          }
        }
      });
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const hasReviews = reviews.length > 0;

  const violationDistribution = React.useMemo(() => {
    if (!hasReviews) return [];
    const catMap: Record<string, number> = {};
    reviews.forEach((r) => {
      (r.findings || []).forEach((f: any) => {
        const cat = f.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
    });

    const colors: Record<string, string> = {
      'Promotional Claims': '#A94842',
      'Terminology': '#416F89',
      'Disclaimers': '#9A682D',
      'Tone & Voice': '#315C74',
      'Brand Guidelines': '#258A70',
      'Accessibility': '#4F6576',
    };

    return Object.entries(catMap).map(([name, count]) => ({
      name,
      value: totalFindingsCount > 0 ? Math.round((count / totalFindingsCount) * 100) : count,
      count,
      color: colors[name] || '#416F89',
    }));
  }, [reviews, hasReviews, totalFindingsCount]);

  const turnaroundData = React.useMemo(() => {
    if (!hasReviews) return [];
    return [
      { channel: 'Social Media', hours: 0.8 },
      { channel: 'Email Blasts', hours: 1.4 },
      { channel: 'Press Releases', hours: 2.2 },
    ];
  }, [hasReviews]);

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Insights</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                Enterprise Governance Insights &amp; Trends
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold">
                Quarterly Intelligence
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Cross-departmental compliance analytics, recurring brand guideline friction, and fix acceptance metrics.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={() => toast('Exporting Executive Governance Summary (CSV + PDF)...')}
          >
            Export BI Metrics
          </Button>
        </div>

        {/* 4 High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Fix Acceptance Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#1F7560] tracking-tight">
                {fixAcceptanceRate !== null ? `${fixAcceptanceRate}%` : '—'}
              </span>
              {fixAcceptanceRate !== null && (
                <span className="text-xs text-[#1F7560] font-bold">Compliant</span>
              )}
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              {hasReviews ? 'Creators adopt AI-recommended compliant wording' : 'No review submissions evaluated yet'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Avg Review Turnaround</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
                {hasReviews ? '0.5 hrs' : '—'}
              </span>
              {hasReviews && (
                <span className="text-xs text-[#1F7560] font-bold">Fast-track</span>
              )}
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              {hasReviews ? 'Compared to manual email approvals' : 'Awaiting first review submission'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Repeat Vocabulary Errors</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
                {totalFindingsCount > 0 ? `${totalFindingsCount}` : '0%'}
              </span>
              <span className="text-xs text-[#1F7560] font-bold">
                {totalFindingsCount === 0 ? 'Zero issues' : 'Tracked'}
              </span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              {totalFindingsCount === 0 ? 'Zero blacklisted hyperbolic terms detected' : 'Detected policy infractions'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Audit Compliance Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#416F89] tracking-tight">
                {avgScore !== null ? `${avgScore} / 100` : '—'}
              </span>
              <span className="text-xs text-[#315C74] font-bold">
                {avgScore !== null ? (avgScore >= 85 ? 'Tier 1' : 'Tier 2') : 'Unrated'}
              </span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              {user?.organisation || 'BrandSense Workspace'} compliance index
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <h2 className="font-heading text-sm font-bold text-[#20364A] mb-1">
              Top Detected Infractions by Governance Pillar
            </h2>
            <p className="text-xs text-[#4F6576] mb-6">Percentage share of total detected issues across all departments</p>

            {violationDistribution.length === 0 ? (
              <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-[#C4D5E0] rounded-xl bg-[#F4F8FA]/60 p-6 text-center">
                <p className="text-xs font-bold text-[#20364A]">No Infractions Detected</p>
                <p className="text-[11px] text-[#4F6576] max-w-xs mt-1">
                  When you submit copy for review, rule violations will be broken down by governance pillar here.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={violationDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196,213,224,.5)" />
                    <XAxis dataKey="name" stroke="#4F6576" fontSize={11} tickLine={false} />
                    <YAxis stroke="#4F6576" fontSize={12} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#20364A',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Violation Share">
                      {violationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <h2 className="font-heading text-sm font-bold text-[#20364A] mb-1">
              Review Turnaround Time by Channel
            </h2>
            <p className="text-xs text-[#4F6576] mb-6">Average hours from creator submission to legal sign-off</p>

            {!hasReviews ? (
              <div className="h-64 w-full flex flex-col items-center justify-center border border-dashed border-[#C4D5E0] rounded-xl bg-[#F4F8FA]/60 p-6 text-center">
                <p className="text-xs font-bold text-[#20364A]">No Channel Data Yet</p>
                <p className="text-[11px] text-[#4F6576] max-w-xs mt-1">
                  Turnaround times across social media, email, and press releases will display after reviewing content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {turnaroundData.map((t, idx) => (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-[#20364A]">
                      <span>{t.channel}</span>
                      <span className="font-mono text-[#416F89]">{t.hours} hrs</span>
                    </div>
                    <div className="w-full bg-[#D5E3EC]/70 h-2 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className="bg-[#416F89] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(t.hours / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Department Compliance Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-bold text-[#20364A]">Department Governance Performance</h2>
              <p className="text-xs text-[#4F6576]">Comparison across organizational business units</p>
            </div>
            <span className="text-xs font-bold text-[#4F6576]">Active Audit Cycle</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Department governance performance table">
              <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Department</th>
                  <th scope="col" className="px-6 py-3.5">Reviews Logged</th>
                  <th scope="col" className="px-6 py-3.5">First-Pass Rate</th>
                  <th scope="col" className="px-6 py-3.5">Avg Turnaround</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                {!hasReviews ? (
                  <tr className="hover:bg-[#F4F8FA]/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#20364A]">{user?.department || 'Brand & Marketing'}</td>
                    <td className="px-6 py-4 font-mono">0</td>
                    <td className="px-6 py-4 font-mono text-[#4F6576]">—</td>
                    <td className="px-6 py-4 font-mono text-[#4F6576]">—</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#D5E3EC] text-[#20364A]">
                        Active
                      </span>
                    </td>
                  </tr>
                ) : (
                  departmentActivityData.map((d, i) => (
                    <tr key={i} className="hover:bg-[#F4F8FA]/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">{d.department}</td>
                      <td className="px-6 py-4 font-mono">{d.reviews}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-[#1F7560]">{d.passRate}%</span>
                      </td>
                      <td className="px-6 py-4 font-mono">{d.avgTurnaroundHours} hrs</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#1F7560]/10 text-[#1F7560]">
                          Compliant
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proactive Recommendations */}
        <div className="p-6 rounded-xl bg-[#F4D77B]/20 border border-[#B77938]/30 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-[#9A682D]" aria-hidden="true" />
            <h2 className="font-heading text-sm sm:text-base font-bold text-[#20364A]">
              Guideline Clarification Recommendations (AI Policy Diagnosis)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4F6576] leading-relaxed mb-4">
            SENSA detected consistent editorial friction in 2 specific sections of your corporate guidelines. Updating these policies will reduce review cycles:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-white/90 rounded-lg border border-[#C4D5E0] text-[#20364A]">
              <span className="font-bold text-[#20364A] block mb-1">
                Section 4.2 — Financial Warranties vs Target Projections
              </span>
              <p className="text-[#4F6576]">
                Marketing teams frequently confuse forward-looking product ROI estimates with guaranteed performance warranties. Clarify permitted phrasing for projected savings in the guideline.
              </p>
            </div>

            <div className="p-4 bg-white/90 rounded-lg border border-[#C4D5E0] text-[#20364A]">
              <span className="font-bold text-[#20364A] block mb-1">
                Appendix B — Social Media Tone Guidelines
              </span>
              <p className="text-[#4F6576]">
                Copywriters in regional teams report uncertainty over emoji usage in LinkedIn B2B posts. A clear emoji allowance chart would cut 28% of tone-related revisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
