'use client';

import React, { useState } from 'react';
import { Settings, Bell, Sparkles, Save } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CreatorSettingsPage() {
  const { toast } = useToast();
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Creator preferences saved.');
  };

  return (
    <RoleShell role="Creator" title="Creator Studio Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C4D5E0]">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">Review &amp; Copilot Preferences</h2>
              <p className="text-xs text-[#4F6576]">Customize AI review behavior and notification frequency.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#20364A]">Auto-Highlight Findings on Review</p>
                  <p className="text-[11px] text-[#4F6576]">Visually mark matched infractions directly in the text editor</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoHighlight}
                  onChange={(e) => setAutoHighlight(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#C4D5E0]/60">
                <div>
                  <p className="font-bold text-[#20364A]">Email Decision Alerts</p>
                  <p className="text-[11px] text-[#4F6576]">Notify via email whenever a reviewer approves or requests changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

