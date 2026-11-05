'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Database,
  Lock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [platformName, setPlatformName] = useState('BrandSense Global Platform');
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(168);
  const [mfaRequired, setMfaRequired] = useState(true);
  const [logRetentionDays, setLogRetentionDays] = useState(90);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Platform master settings updated successfully.');
  };

  return (
    <RoleShell role="Super Admin" title="Platform Security &amp; Root Settings">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C4D5E0]">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">
                Super Admin Security &amp; Retention Policies
              </h2>
              <p className="text-xs text-[#4F6576]">
                Root-level security protocols applied across all connected customer tenants.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#20364A] block mb-1">Platform Installation Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1">Session JWT Expiry (Hours)</label>
                <input
                  type="number"
                  value={sessionTimeoutHours}
                  onChange={(e) => setSessionTimeoutHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#20364A] block mb-1">Audit Log Retention (Days)</label>
                <input
                  type="number"
                  value={logRetentionDays}
                  onChange={(e) => setLogRetentionDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
                />
              </div>
            </div>

            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#20364A]">Require Multi-Factor Authentication (MFA)</p>
                <p className="text-[11px] text-[#4F6576]">Mandate TOTP authenticator app verification for all Administrator roles</p>
              </div>
              <input
                type="checkbox"
                checked={mfaRequired}
                onChange={(e) => setMfaRequired(e.target.checked)}
                className="rounded text-[#416F89] focus:ring-[#416F89]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                Save Security Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

