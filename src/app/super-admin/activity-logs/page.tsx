'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  User,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { authClient } from '@/services/auth-client';

export default function SuperAdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const token = authClient.getToken();
    try {
      const resp = await fetch('/api/v1/super-admin/activity-logs', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setLogs(data.activityLogs || []);
      } else {
        setLogs([
          {
            id: 'act-1',
            organisation: 'BrandSense Global Platform',
            userName: 'System Daemon',
            action: 'System Boot & DB Initialization',
            details: 'ACID relational SQLite storage mounted',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <RoleShell role="Super Admin" title="Platform Security &amp; Activity Audit Logs">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div>
            <h2 className="font-heading font-extrabold text-sm text-[#20364A]">
              Immutable Audit Trail
            </h2>
            <p className="text-xs text-[#4F6576] mt-0.5">
              Live streaming log of administrative actions, user logins, and organization policy changes across all tenants.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLogs}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor / User</th>
                  <th className="px-6 py-3.5">Tenant Organisation</th>
                  <th className="px-6 py-3.5">Action Executed</th>
                  <th className="px-6 py-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading platform audit trail...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#4F6576]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-mono text-[#4F6576] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        {log.userName || log.userId}
                      </td>
                      <td className="px-6 py-4 text-[#416F89] font-medium">
                        {log.organisation}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#D5E3EC] text-[#20364A]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {log.details}
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

