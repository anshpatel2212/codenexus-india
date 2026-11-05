'use client';

import React, { useState } from 'react';
import { Settings, Building2, Save, Users, Shield } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState(user?.organisation || 'BrandSense Workspace');
  const [requireHumanSignoff, setRequireHumanSignoff] = useState(true);
  const [autoRejectBanned, setAutoRejectBanned] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Organisation settings updated successfully.');
  };

  return (
    <RoleShell role="Admin" title="Organisation Governance Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C4D5E0]">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">Workspace Policies</h2>
              <p className="text-xs text-[#4F6576]">Configure automated publishing gates and compliance sign-off rules.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#20364A] block mb-1">Organisation Brand Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
            </div>

            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#20364A]">Mandatory Human Pre-Publication Sign-Off</p>
                  <p className="text-[11px] text-[#4F6576]">Require an authorized Reviewer or Legal Manager decision before status can reach Approved</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireHumanSignoff}
                  onChange={(e) => setRequireHumanSignoff(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#C4D5E0]/60">
                <div>
                  <p className="font-bold text-[#20364A]">Auto-Block Blacklisted Hyperbole</p>
                  <p className="text-[11px] text-[#4F6576]">Immediately mark drafts with critical terminology infractions as Needs Revision</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRejectBanned}
                  onChange={(e) => setAutoRejectBanned(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                Save Organisation Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

