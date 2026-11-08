'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/services/auth-client';

export default function SuperAdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const token = authClient.getToken();
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const resp = await fetch(`/api/v1/super-admin/users?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setUsers(data.users || []);
      } else {
        setUsers([
          {
            id: 'usr-demo-superadmin',
            name: 'Alexander Vance',
            email: 'demo-superadmin@brandsense.ai',
            role: 'Super Admin',
            organisationName: 'BrandSense Global Platform',
            status: 'active',
            isDemo: true,
            createdAt: '2026-11-01',
          },
          {
            id: 'usr-demo-admin',
            name: 'Julian Thorne',
            email: 'demo-admin@brandsense.ai',
            role: 'Admin',
            organisationName: 'BrandSense Demo Corp',
            status: 'active',
            isDemo: true,
            createdAt: '2026-11-01',
          },
        ]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const token = authClient.getToken();
    try {
      const resp = await fetch(`/api/v1/super-admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (resp.ok) {
        toast(`User status changed to '${nextStatus}'.`);
        fetchUsers();
      }
    } catch {
      toast('Failed to update user status.', 'error');
    }
  };

  return (
    <RoleShell role="Super Admin" title="Global User Directory & Privileges">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search by user name, email, or organisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#C4D5E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#C4D5E0] text-xs text-[#20364A] bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Organisation Admin</option>
              <option value="Creator">Creator</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Organisation Context</th>
                  <th className="px-6 py-3.5">Account Type</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading user directory...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#4F6576]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#20364A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#20364A]">{u.name}</p>
                            <p className="text-[11px] text-[#4F6576]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#D5E3EC] text-[#20364A]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#416F89] font-medium">
                        {u.organisationName}
                      </td>
                      <td className="px-6 py-4">
                        {u.isDemo ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Demo Persona
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Live Account
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'Super Admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={u.status === 'active' ? 'text-amber-700' : 'text-emerald-700'}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        )}
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

