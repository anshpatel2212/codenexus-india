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
  const [totalFindingsCount, setTotalFindingsCount] = useState(142);
  const [fixAcceptanceRate, setFixAcceptanceRate] = useState(92.4);

  useEffect(() => {
    let active = true;
    apiClient.getReviews(user?.organizationId).then((reviews) => {
      if (!active || reviews.length === 0) return;
      let totalFindings = 0;
      let accepted = 0;
      let rejected = 0;

      reviews.forEach((r) => {
        (r.findings || []).forEach((f) => {
          totalFindings++;
          if (f.status === 'accepted') accepted++;
          if (f.status === 'rejected') rejected++;
        });
      });

      if (totalFindings > 0) setTotalFindingsCount(totalFindings);
      const totalDecided = accepted + rejected;
      if (totalDecided > 0) {
        setFixAcceptanceRate(Math.round((accepted / totalDecided) * 1000) / 10);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const violationDistribution = [
    { name: 'Claims & Facts', value: 42, color: '#C65E57' },
    { name: 'Terminology', value: 24, color: '#416F89' },
    { name: 'Disclaimers', value: 18, color: '#B77938' },
    { name: 'Tone & Voice', value: 12, color: '#315C74' },
    { name: 'Accessibility', value: 4, color: '#718494' },
  ];

  const turnaroundData = [
    { channel: 'Social Media', hours: 0.8 },
    { channel: 'Email Blasts', hours: 1.4 },
    { channel: 'Press Releases', hours: 2.2 },
    { channel: 'Whitepapers', hours: 4.8 },
    { channel: 'Video Scripts', hours: 3.1 },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Insights</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                Enterprise Governance Insights & Trends
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#31566D] text-xs font-bold">
                Quarterly Intelligence
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#718494]">
              Cross-departmental compliance analytics, recurring brand guideline friction, and fix acceptance metrics.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => toast('Exporting Executive Governance Summary (CSV + PDF)...')}
          >
            Export BI Metrics
          </Button>
        </div>

        {/* 4 High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#718494]">Fix Acceptance Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#258A70] tracking-tight">92.4%</span>
              <span className="text-xs text-[#258A70] font-bold">↑ 6.1%</span>
            </div>
            <p className="text-[11px] text-[#718494] mt-1">Creators adopt AI-recommended compliant wording</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#718494]">Avg Review Turnaround</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">2.4 hrs</span>
              <span className="text-xs text-[#258A70] font-bold">↓ 68% faster</span>
            </div>
            <p className="text-[11px] text-[#718494] mt-1">Compared to manual email approvals</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#718494]">Repeat Vocabulary Errors</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">14%</span>
              <span className="text-xs text-[#258A70] font-bold">↓ 42% drops</span>
            </div>
            <p className="text-[11px] text-[#718494] mt-1">Drop in blacklisted hyperbolic terms</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#718494]">Audit Compliance Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#416F89] tracking-tight">94 / 100</span>
              <span className="text-xs text-[#315C74] font-bold">Tier 1</span>
            </div>
            <p className="text-[11px] text-[#718494] mt-1">Acme Holdings institutional health</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <h3 className="font-heading text-sm font-bold text-[#20364A] mb-1">
              Top Detected Infractions by Governance Pillar
            </h3>
            <p className="text-xs text-[#718494] mb-6">Percentage share of total detected issues across all departments</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(196,213,224,.5)" />
                  <XAxis dataKey="name" stroke="#718494" fontSize={11} tickLine={false} />
                  <YAxis stroke="#718494" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#20364A',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
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
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <h3 className="font-heading text-sm font-bold text-[#20364A] mb-1">
              Review Turnaround Time by Channel
            </h3>
            <p className="text-xs text-[#718494] mb-6">Average hours from creator submission to legal sign-off</p>

            <div className="space-y-4">
              {turnaroundData.map((t, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#20364A]">
                    <span>{t.channel}</span>
                    <span className="font-mono text-[#416F89]">{t.hours} hrs</span>
                  </div>
                  <div className="w-full bg-[#D5E3EC]/70 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#416F89] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(t.hours / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Compliance Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-[#20364A]">Department Governance Performance</h3>
              <p className="text-xs text-[#718494]">Comparison across organizational business units</p>
            </div>
            <span className="text-xs font-bold text-[#718494]">Q3 Audit Cycle</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#D5E3EC]/30 text-[#718494] uppercase tracking-wider text-[10px] font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Reviews Logged</th>
                  <th className="px-6 py-3.5">First-Pass Rate</th>
                  <th className="px-6 py-3.5">Avg Turnaround</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#263B4D]">
                {departmentActivityData.map((d, i) => (
                  <tr key={i} className="hover:bg-white transition-colors">
                    <td className="px-6 py-4 font-bold text-[#20364A]">{d.department}</td>
                    <td className="px-6 py-4 font-mono">{d.reviews}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#258A70]">{d.passRate}%</span>
                    </td>
                    <td className="px-6 py-4 font-mono">{d.avgTurnaroundHours} hrs</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#258A70]/10 text-[#258A70]">
                        Compliant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proactive Recommendations */}
        <div className="p-6 rounded-xl bg-[rgba(244,215,123,.2)] border border-[#B77938]/25 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-[#B77938]" />
            <h3 className="font-heading text-sm font-bold text-[#20364A]">
              Guideline Clarification Recommendations (AI Policy Diagnosis)
            </h3>
          </div>
          <p className="text-xs text-[#718494] leading-relaxed mb-4">
            SENSA detected consistent editorial friction in 2 specific sections of your corporate guidelines. Updating these policies will reduce review cycles:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/80 rounded-lg border border-[#C4D5E0] text-[#263B4D]">
              <span className="font-bold text-[#20364A] block mb-1">
                Section 4.2 — Financial Warranties vs Target Projections
              </span>
              <p className="text-[#718494]">
                Marketing teams frequently confuse forward-looking product ROI estimates with guaranteed performance warranties. Clarify permitted phrasing for projected savings in the guideline.
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-lg border border-[#C4D5E0] text-[#263B4D]">
              <span className="font-bold text-[#20364A] block mb-1">
                Appendix B — Social Media Tone Guidelines
              </span>
              <p className="text-[#718494]">
                Copywriters in regional teams report uncertainty over emoji usage in LinkedIn B2B posts. A clear emoji allowance chart would cut 28% of tone-related revisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
