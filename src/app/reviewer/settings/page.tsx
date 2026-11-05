'use client';

import React, { useState } from 'react';
import { Settings, Bell, Clock, Save } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function ReviewerSettingsPage() {
  const { toast } = useToast();
  const [slaWarningHours, setSlaWarningHours] = useState(4);
  const [autoNotifyCreators, setAutoNotifyCreators] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Reviewer governance settings saved.');
  };

  return (
    <RoleShell role="Reviewer" title="Reviewer Queue Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#C4D5E0]">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-[#20364A]">Approval Routing &amp; SLA Rules</h2>
              <p className="text-xs text-[#4F6576]">Configure turnaround reminders and notification thresholds.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#20364A] block mb-1">Queue SLA Warning Threshold (Hours)</label>
              <input
                type="number"
                value={slaWarningHours}
                onChange={(e) => setSlaWarningHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#C4D5E0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#416F89]"
              />
              <p className="text-[11px] text-[#4F6576] mt-1">Alerts will trigger if a pending submission is undecided past this duration.</p>
            </div>

            <div className="p-4 bg-[#F4F8FA] rounded-xl border border-[#C4D5E0]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#20364A]">Instant Creator Notifications</p>
                  <p className="text-[11px] text-[#4F6576]">Immediately dispatch in-app and email notices upon sign-off or change requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoNotifyCreators}
                  onChange={(e) => setAutoNotifyCreators(e.target.checked)}
                  className="rounded text-[#416F89] focus:ring-[#416F89]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                Save Reviewer Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleShell>
  );
}

