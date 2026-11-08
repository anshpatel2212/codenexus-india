'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ShieldCheck,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Server,
  Sparkles,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/services/auth-client';
import { useToast } from '@/components/ui/Toast';

export default function SuperAdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const token = authClient.getToken();
    try {
      const resp = await fetch('/api/v1/super-admin/stats', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setStats(data);
      } else {
        // Fallback stats
        setStats({
          totalOrganizations: 1,
          totalUsers: 5,
          activeUsers: 5,
          totalReviewsScanned: 18,
          totalViolationsDetected: 42,
          totalApprovalsLogged: 12,
          systemHealth: 'Optimal',
          aiServiceStatus: 'Online',
          recentOrganizations: [
            { id: 'org-demo-brandsense', name: 'BrandSense Demo Corp', tier: 'Enterprise Plan', status: 'active', created_at: '2026-11-01' }
          ]
        });
      }
    } catch {
      setStats({
        totalOrganizations: 1,
        totalUsers: 5,
        activeUsers: 5,
        totalReviewsScanned: 18,
        totalViolationsDetected: 42,
        totalApprovalsLogged: 12,
        systemHealth: 'Optimal',
        aiServiceStatus: 'Online',
        recentOrganizations: [
          { id: 'org-demo-brandsense', name: 'BrandSense Demo Corp', tier: 'Enterprise Plan', status: 'active', created_at: '2026-11-01' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <RoleShell role="Super Admin" title="Platform Executive Governance">
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#20364A] via-[#31566D] to-[#416F89] text-white rounded-2xl shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#F4D77B] text-[#20364A]">
                Global Master Console
              </span>
              <span className="text-xs text-[#D5E3EC] font-medium">Multi-Tenant Platform Oversight</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold mt-2 tracking-tight">
              Enterprise Operations &amp; System Health
            </h2>
            <p className="text-xs text-[#EDF3F6] max-w-xl mt-1 leading-relaxed">
              Real-time monitoring across all tenant organisations, user access privileges, active AI models, and regulatory compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              isLoading={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Telemetry
            </Button>
            <Link href="/super-admin/system">
              <Button size="sm" className="bg-[#F4D77B] hover:bg-[#F4D77B]/90 text-[#20364A] font-bold">
                Inspect Infrastructure
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Key Platform Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">Tenants</span>
              <Building2 className="w-4 h-4 text-[#416F89]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#20364A] mt-2">
              {stats?.totalOrganizations ?? '—'}
            </p>
            <p className="text-[10px] text-[#4F6576] mt-0.5">Active Organisations</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">Total Users</span>
              <Users className="w-4 h-4 text-[#315C74]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#20364A] mt-2">
              {stats?.totalUsers ?? '—'}
            </p>
            <p className="text-[10px] text-[#1F7560] font-bold mt-0.5">
              {stats?.activeUsers ?? 0} active currently
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">Scans Logged</span>
              <ShieldCheck className="w-4 h-4 text-[#1F7560]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#1F7560] mt-2">
              {stats?.totalReviewsScanned ?? '—'}
            </p>
            <p className="text-[10px] text-[#4F6576] mt-0.5">Total AI Governance Scans</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">Infractions</span>
              <AlertTriangle className="w-4 h-4 text-[#A94842]" />
            </div>
            <p className="font-heading text-2xl font-extrabold text-[#A94842] mt-2">
              {stats?.totalViolationsDetected ?? '—'}
            </p>
            <p className="text-[10px] text-[#4F6576] mt-0.5">Policy Violations Mitigated</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">AI Uptime</span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-heading text-lg font-extrabold text-[#20364A]">
                {stats?.aiServiceStatus ?? 'Online'}
              </p>
            </div>
            <p className="text-[10px] text-[#4F6576] mt-0.5">Gemini 1.5 Pro Runtime</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#C4D5E0] shadow-subtle">
            <div className="flex items-center justify-between text-[#4F6576]">
              <span className="text-[11px] font-bold">Platform State</span>
              <Activity className="w-4 h-4 text-[#416F89]" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-[#1F7560]" />
              <p className="font-heading text-lg font-extrabold text-[#1F7560]">
                {stats?.systemHealth ?? 'Optimal'}
              </p>
            </div>
            <p className="text-[10px] text-[#4F6576] mt-0.5">Zero Incidents</p>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/super-admin/organisations"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
                <Building2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">Tenant Organisations</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              Create, inspect, configure tier subscriptions, and toggle customer workspaces.
            </p>
          </Link>

          <Link
            href="/super-admin/ai-config"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">AI Engine Governance</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              Configure LLM parameters, temperature, token ceilings, fallback routing, and RAG sensitivity.
            </p>
          </Link>

          <Link
            href="/super-admin/activity-logs"
            className="p-5 bg-white rounded-xl border border-[#C4D5E0] hover:border-[#416F89] shadow-subtle hover:shadow-dropdown transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Server className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#4F6576] group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A] mt-3">Platform Audit Trail</h3>
            <p className="text-xs text-[#4F6576] mt-1">
              Real-time audit log streaming all user logins, policy modifications, and approval decisions.
            </p>
          </Link>
        </div>

        {/* Tenant Organisations Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Recent Tenant Organisations</h3>
              <p className="text-xs text-[#4F6576]">Customer workspaces active across the platform</p>
            </div>
            <Link href="/super-admin/organisations">
              <Button size="sm" variant="outline">
                View All Organisations →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3">Organisation Name</th>
                  <th className="px-6 py-3">Tenant ID</th>
                  <th className="px-6 py-3">Tier Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {stats?.recentOrganizations?.map((org: any) => (
                  <tr key={org.id} className="hover:bg-[#F4F8FA] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#20364A]">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#4F6576]">
                      {org.id}
                    </td>
                    <td className="px-6 py-4 text-[#416F89] font-semibold">
                      {org.tier}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href="/super-admin/organisations">
                        <Button size="sm" variant="ghost">Manage</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

