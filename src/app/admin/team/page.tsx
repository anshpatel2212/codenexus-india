'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Copy,
  Check,
  Shield,
  UserCheck,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';

export default function AdminTeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Creator' | 'Reviewer' | 'Manager'>('Creator');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const teamMembers = user?.isDemo
    ? [
        { name: 'Julian Thorne', email: 'demo-admin@brandsense.ai', role: 'Admin', department: 'Executive Governance', status: 'Active' },
        { name: 'Sarah Chen, Esq.', email: 'demo-reviewer@brandsense.ai', role: 'Reviewer', department: 'Legal & Regulatory Compliance', status: 'Active' },
        { name: 'Marcus Vance', email: 'demo-creator@brandsense.ai', role: 'Creator', department: 'Growth Copywriting & Social', status: 'Active' },
        { name: 'Elena Rostova', email: 'demo-manager@brandsense.ai', role: 'Manager', department: 'Brand & Global Marketing', status: 'Active' },
      ]
    : [
        { name: user?.name || 'Administrator', email: user?.email || 'admin@company.com', role: 'Admin', department: user?.department || 'Brand Management', status: 'Active' },
      ];

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const token = `inv-${Math.random().toString(36).substring(2, 10)}`;
    const link = `${window.location.origin}/signup?token=${token}&role=${inviteRole}`;
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
    <RoleShell role="Admin" title="Team Members &amp; Role Assignments">
      <div className="space-y-6">
        {/* Invite Box */}
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#20364A]">Invite Team Colleague</h3>
              <p className="text-xs text-[#4F6576]">Assign an authorized role with scoped workspace access.</p>
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
              onChange={(e: any) => setInviteRole(e.target.value)}
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

        {/* Members Table */}
        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle overflow-hidden">
          <div className="p-5 border-b border-[#C4D5E0]">
            <h3 className="font-heading font-bold text-sm text-[#20364A]">Active Team Members</h3>
            <p className="text-xs text-[#4F6576]">All members authorized to access this organisation workspace</p>
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
                {teamMembers.map((member, i) => (
                  <tr key={i} className="hover:bg-[#F4F8FA] transition-colors">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

