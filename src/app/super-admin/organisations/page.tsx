'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Shield,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/services/auth-client';

export default function SuperAdminOrganisationsPage() {
  const { toast } = useToast();
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgTier, setNewOrgTier] = useState('Standard Plan');
  const [isCreating, setIsCreating] = useState(false);

  const fetchOrganisations = async () => {
    setLoading(true);
    const token = authClient.getToken();
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const resp = await fetch(`/api/v1/super-admin/organisations${q}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        setOrganisations(data.organisations || []);
      } else {
        setOrganisations([
          {
            id: 'org-demo-brandsense',
            name: 'BrandSense Demo Corp',
            slug: 'brandsense-demo',
            tier: 'Enterprise Plan',
            status: 'active',
            userCount: 4,
            reviewCount: 18,
            createdAt: '2026-11-01',
          },
        ]);
      }
    } catch {
      setOrganisations([
        {
          id: 'org-demo-brandsense',
          name: 'BrandSense Demo Corp',
          slug: 'brandsense-demo',
          tier: 'Enterprise Plan',
          status: 'active',
          userCount: 4,
          reviewCount: 18,
          createdAt: '2026-11-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisations();
  }, [search]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsCreating(true);
    const token = authClient.getToken();
    try {
      const resp = await fetch('/api/v1/super-admin/organisations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newOrgName.trim(),
          tier: newOrgTier,
        }),
      });

      if (resp.ok) {
        toast(`Organisation '${newOrgName}' successfully created.`);
        setNewOrgName('');
        setShowCreateModal(false);
        fetchOrganisations();
      } else {
        toast('Failed to create organisation.', 'error');
      }
    } catch {
      toast('Network error creating organisation.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const token = authClient.getToken();
    try {
      const resp = await fetch(`/api/v1/super-admin/organisations/${orgId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (resp.ok) {
        toast(`Organisation status updated to '${nextStatus}'.`);
        fetchOrganisations();
      }
    } catch {
      toast('Failed to update status.', 'error');
    }
  };

  return (
    <RoleShell role="Super Admin" title="Tenant Organisations Directory">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4F6576]" />
            <input
              type="text"
              placeholder="Search organisations by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#C4D5E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Organisation
          </Button>
        </div>

        {/* Organisations List Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Organisation</th>
                  <th className="px-6 py-3.5">Tenant Slug / ID</th>
                  <th className="px-6 py-3.5">Subscription Tier</th>
                  <th className="px-6 py-3.5">Team Members</th>
                  <th className="px-6 py-3.5">Reviews Scanned</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading organisations directory...
                    </td>
                  </tr>
                ) : organisations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#4F6576]">
                      No tenant organisations found matching query.
                    </td>
                  </tr>
                ) : (
                  organisations.map((org) => (
                    <tr key={org.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#20364A] text-white flex items-center justify-center font-bold text-xs">
                            {org.name.charAt(0)}
                          </div>
                          <span>{org.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#4F6576]">
                        {org.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#416F89]">
                        {org.tier}
                      </td>
                      <td className="px-6 py-4 text-[#20364A]">
                        {org.userCount ?? 1} members
                      </td>
                      <td className="px-6 py-4 text-[#20364A]">
                        {org.reviewCount ?? 0} reviews
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            org.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(org.id, org.status)}
                          className={org.status === 'active' ? 'text-amber-700' : 'text-emerald-700'}
                        >
                          {org.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-[#C4D5E0] space-y-4">
              <h3 className="font-heading font-bold text-base text-[#20364A]">Provision New Organisation</h3>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Acme Global Inc."
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#20364A] block mb-1">Subscription Plan</label>
                  <select
                    value={newOrgTier}
                    onChange={(e) => setNewOrgTier(e.target.value)}
                    className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                  >
                    <option value="Standard Plan">Standard Plan (Up to 10 creators)</option>
                    <option value="Enterprise Plan">Enterprise Plan (Unlimited reviews, Dedicated RAG)</option>
                    <option value="Enterprise Plus">Enterprise Plus (Custom SLAS, On-prem models)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
                    Provision Workspace
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleShell>
  );
}

