'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { 
  Download, 
  HelpCircle,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
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
import { GovernanceInsights } from '@/types';

export default function InsightsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const data = await apiClient.getGovernanceInsights(user?.organizationId);
        if (!active) return;
        setInsights(data);
      } catch (err) {
        console.error('Failed to load governance insights:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [user?.organizationId]);

  const metrics = insights?.metrics;
  const repeatedViolations = insights?.repeatedViolations || [];
  const frequentlyOverridden = insights?.frequentlyOverriddenRules || [];
  const unclearGuidelines = insights?.unclearGuidelines || [];
  const turnaroundData = insights?.turnaroundByChannel || [];
  const violationDistribution = insights?.violationDistribution || [];

  const handleExportBI = () => {
    if (!insights) return;
    const report = `# BrandSense Enterprise Governance BI Metrics Report\nOrganization: ${user?.organisation || 'BrandSense Enterprise'}\nGenerated: ${insights.generatedAt}\n\n## High-Level Metrics\n- Total Audits: ${metrics?.totalReviews || 0}\n- Detected Infractions: ${metrics?.totalFindings || 0}\n- Overall Compliance Index: ${metrics?.auditComplianceScore || 0} / 100\n- Fix Acceptance Rate: ${metrics?.fixAcceptanceRate || 0}%\n- Average Turnaround: ${metrics?.avgTurnaroundHours || 0.5} hrs\n\n## Repeated Brand Infractions (${repeatedViolations.length}):\n${repeatedViolations.map((v, i) => `${i + 1}. [${v.riskTier} Risk] ${v.category}: ${v.reason}\n   Occurrences: ${v.occurrences} | Grounded Confidence: ${v.avgConfidence}%\n   Sample Flagged Copy: "${v.samplePhrase}"\n   Source Guideline: ${v.sourceDocument}`).join('\n\n')}\n\n## Frequently Overridden Rules (${frequentlyOverridden.length}):\n${frequentlyOverridden.map((r, i) => `${i + 1}. ${r.category}: ${r.ruleDescription}\n   Total Overrides: ${r.totalOverrides} (Rejected: ${r.rejectedCount}, Modified: ${r.modifiedCount})\n   Creator Rationale: ${r.primaryReason}`).join('\n\n')}\n\n## Unclear Guidelines Needing Clarification (${unclearGuidelines.length}):\n${unclearGuidelines.map((u, i) => `${i + 1}. ${u.guidelineTitle} (Friction Score: ${u.frictionScore}/100)\n   Issue: ${u.issueSummary}\n   Recommended Action: ${u.recommendedClarification}`).join('\n\n')}`;
    
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BrandSense_Governance_Insights_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Governance Intelligence Report exported successfully.');
  };

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <span className="bs-eyebrow block mb-1.5">Governance Analytics</span>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#20364A] tracking-tight">
                Enterprise Governance Insights &amp; Trends
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-[#D5E3EC] text-[#20364A] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
                Live Database Grounding
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#4F6576]">
              Recurring brand guideline friction, automated override tracking, and evidence-backed policy diagnostics.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            onClick={handleExportBI}
          >
            Export BI Metrics (.MD)
          </Button>
        </div>

        {/* 4 High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Fix Acceptance Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#1F7560] tracking-tight">
                {metrics ? `${metrics.fixAcceptanceRate}%` : '—'}
              </span>
              <span className="text-xs text-[#1F7560] font-bold">Compliant</span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              Creators adopt AI-recommended compliant wording
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Avg Review Turnaround</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#20364A] tracking-tight">
                {metrics ? `${metrics.avgTurnaroundHours} hrs` : '0.5 hrs'}
              </span>
              <span className="text-xs text-[#1F7560] font-bold">Fast-track</span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              Automated pre-publication approval SLA
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Repeat Brand Infractions</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#A94842] tracking-tight">
                {metrics ? metrics.repeatInfractionsCount : 0}
              </span>
              <span className="text-xs text-[#A94842] font-bold">
                Clustered
              </span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              Persistent friction points across submissions
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <span className="text-xs font-bold text-[#4F6576]">Audit Compliance Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="font-heading text-2xl font-extrabold text-[#416F89] tracking-tight">
                {metrics ? `${metrics.auditComplianceScore} / 100` : '—'}
              </span>
              <span className="text-xs text-[#315C74] font-bold">
                {metrics && metrics.auditComplianceScore >= 80 ? 'Tier 1' : 'Tier 2'}
              </span>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              {user?.organisation || 'Enterprise'} organizational compliance index
            </p>
          </div>
        </div>

        {/* Improvement 3: Repeated Brand Violation Detection Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#A94842]" aria-hidden="true" />
                <h2 className="font-heading text-base font-bold text-[#20364A]">
                  Repeated Brand Violation Detection
                </h2>
              </div>
              <p className="text-xs text-[#4F6576] mt-0.5">
                Automatically clustered recurring rule violations across all department drafts
              </p>
            </div>
            <span className="text-xs font-bold bg-[#A94842]/10 text-[#A94842] px-2.5 py-1 rounded-md border border-[#A94842]/20">
              {repeatedViolations.length} Recurrent Patterns Detected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Repeated brand violations table">
              <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Pillar / Category</th>
                  <th scope="col" className="px-6 py-3.5">Detected Rule Violation</th>
                  <th scope="col" className="px-6 py-3.5">Occurrences</th>
                  <th scope="col" className="px-6 py-3.5">Risk Tier</th>
                  <th scope="col" className="px-6 py-3.5">Grounded Confidence</th>
                  <th scope="col" className="px-6 py-3.5">Sample Problem Phrase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#20364A]">
                {repeatedViolations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-[#4F6576]">
                      No repeated brand infractions detected in current workspace submissions.
                    </td>
                  </tr>
                ) : (
                  repeatedViolations.map((v, i) => (
                    <tr key={i} className="hover:bg-[#F4F8FA]/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#EDF3F6] border border-[#C4D5E0] text-xs">
                          {v.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#20364A] max-w-xs">
                        {v.reason}
                        <span className="block text-[11px] text-[#4F6576] font-mono mt-0.5">
                          Source: {v.sourceDocument}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#20364A]">
                        {v.occurrences}x
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          v.riskTier === 'High' || v.riskTier === 'Critical'
                            ? 'bg-[#A94842]/15 text-[#A94842] border border-[#A94842]/30'
                            : v.riskTier === 'Medium'
                            ? 'bg-[#9A682D]/15 text-[#9A682D] border border-[#9A682D]/30'
                            : 'bg-[#416F89]/15 text-[#416F89] border border-[#416F89]/30'
                        }`}>
                          {v.riskTier} Risk
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#1F7560] font-bold">
                        {v.avgConfidence}%
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[#A94842] max-w-xs truncate">
                        “{v.samplePhrase}”
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Improvement 3: Frequently Overridden Rules Analytics Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-[#C4D5E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#9A682D]" aria-hidden="true" />
                <h2 className="font-heading text-base font-bold text-[#20364A]">
                  Frequently Overridden Brand Rules
                </h2>
              </div>
              <p className="text-xs text-[#4F6576] mt-0.5">
                Brand rules where creators or reviewers frequently reject or modify automated AI suggestions
              </p>
            </div>
            <span className="text-xs font-bold bg-[#9A682D]/10 text-[#9A682D] px-2.5 py-1 rounded-md border border-[#9A682D]/20">
              Override Governance Tracker
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Frequently overridden rules table">
              <thead className="bg-[#D5E3EC]/40 text-[#4F6576] uppercase tracking-wider text-xs font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Rule / Policy Description</th>
                  <th scope="col" className="px-6 py-3.5">Total Overrides</th>
                  <th scope="col" className="px-6 py-3.5">Rejected vs Modified</th>
                  <th scope="col" className="px-6 py-3.5">Observed Creator Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0] text-[#20364A]">
                {frequentlyOverridden.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-xs text-[#4F6576]">
                      No rule overrides recorded yet. Suggestions are currently accepted as recommended.
                    </td>
                  </tr>
                ) : (
                  frequentlyOverridden.map((r, idx) => (
                    <tr key={idx} className="hover:bg-[#F4F8FA]/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        <span className="px-2 py-0.5 rounded bg-[#EDF3F6] border border-[#C4D5E0] text-xs">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#20364A] max-w-sm">
                        {r.ruleDescription}
                        <span className="block text-[11px] text-[#4F6576] font-mono mt-0.5">
                          {r.sourceDocument}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#20364A]">
                        {r.totalOverrides}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="text-[#A94842] font-bold">{r.rejectedCount} Rejected</span> •{' '}
                        <span className="text-[#315C74] font-bold">{r.modifiedCount} Custom</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#4F6576] max-w-xs">
                        {r.primaryReason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle">
            <h2 className="font-heading text-sm font-bold text-[#20364A] mb-1">
              Detected Infractions by Governance Pillar
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

            {turnaroundData.length === 0 ? (
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
                        style={{ width: `${Math.min(100, (t.hours / 4) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Improvement 3: Unclear Guidelines Recommendations */}
        <div className="p-6 rounded-xl bg-[#F4D77B]/20 border border-[#B77938]/30 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-[#9A682D]" aria-hidden="true" />
            <h2 className="font-heading text-sm sm:text-base font-bold text-[#20364A]">
              Identification of Unclear Guidelines &amp; Policy Editorial Friction
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4F6576] leading-relaxed mb-4">
            SENSA detected recurring editorial friction and high override rates in the following guidelines. Updating these policies in your knowledge base will prevent revision bottlenecks:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {unclearGuidelines.map((ug, idx) => (
              <div key={idx} className="p-4 bg-white/95 rounded-lg border border-[#C4D5E0] text-[#20364A] shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#20364A]">{ug.guidelineTitle}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#9A682D]/15 text-[#9A682D] border border-[#9A682D]/30">
                    Friction Score: {ug.frictionScore}/100
                  </span>
                </div>
                <p className="text-xs text-[#4F6576] leading-relaxed">
                  <strong className="text-[#20364A]">Diagnosis: </strong>
                  {ug.issueSummary}
                </p>
                <div className="pt-2 border-t border-[#C4D5E0]/60">
                  <span className="text-[11px] font-bold text-[#1F7560] block mb-0.5">
                    Recommended Policy Clarification:
                  </span>
                  <p className="text-xs text-[#20364A] font-medium bg-[#1F7560]/10 p-2.5 rounded border border-[#1F7560]/20">
                    {ug.recommendedClarification}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
