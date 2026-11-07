'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { OrganizationUser } from '@/types';

export default function AdminTeamPage() {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Creator' | 'Reviewer' | 'Manager'>('Creator');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const users = await apiClient.getUsers();
    setMembers(users);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const result = await apiClient.inviteUser(inviteEmail.trim(), inviteRole);
    if (!result.success || !result.inviteLink) {
      toast(result.error || 'Could not create invitation.', 'error');
      return;
    }
    const link = `${window.location.origin}${result.inviteLink}`;
    setInviteLink(link);
    toast(`Invitation generated for ${inviteEmail}.`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast('Invitation URL copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <RoleShell role="Admin" title="Users &amp; Access">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Invite User</h3>
              <p className="text-xs text-[#4F6576]">Assign an authorised role with scoped workspace access.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@yourcompany.com"
              className="flex-1 px-3.5 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Creator' | 'Reviewer' | 'Manager')}
              className="px-3.5 py-2 border border-[#C4D5E0] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#416F89]"
            >
              <option value="Creator">Creator (Drafts &amp; AI Scans)</option>
              <option value="Reviewer">Reviewer (Approvals &amp; Feedback)</option>
              <option value="Manager">Manager (Brand Lead)</option>
            </select>
            <Button type="submit" variant="primary" size="sm">
              Generate Invite Link
            </Button>
          </form>

          {inviteLink && (
            <div className="p-3 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0] flex items-center justify-between gap-3 text-xs">
              <p className="font-mono text-[#416F89] truncate">{inviteLink}</p>
              <Button size="sm" variant="outline" onClick={copyToClipboard} leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#416F89]" />
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Organisation Users</h3>
            </div>
            <p className="text-xs text-[#4F6576] mt-1">
              Actual accounts with access to this organisation workspace
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FA] text-[#4F6576] uppercase tracking-wider font-bold border-b border-[#C4D5E0]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C4D5E0]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#4F6576]">
                      Loading users...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#4F6576]">
                      No users found for this organisation.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F4F8FA] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#20364A]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#20364A] text-white flex items-center justify-center font-bold text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p>{member.name}</p>
                            <p className="text-[11px] text-[#4F6576] font-normal">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#D5E3EC] text-[#20364A]">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#4F6576]">
                        {member.department}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {member.status}
                        </span>
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
