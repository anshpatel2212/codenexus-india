'use client';

import React from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';

export default function CreatorNotificationsPage() {
  const alerts = [
    {
      title: 'Review Signed Off & Approved',
      desc: 'Sarah Chen, Esq. approved your submission "Q3 Product Launch LinkedIn Campaign".',
      time: '1 hour ago',
      type: 'approved',
    },
    {
      title: 'Changes Requested on Ad Copy',
      desc: 'Reviewer requested substantiation citation for performance metric claim in Quarter One campaign.',
      time: '4 hours ago',
      type: 'changes',
    },
  ];

  return (
    <RoleShell role="Creator" title="Creator Notifications">
      <div className="max-w-3xl space-y-4">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Reviewer Alerts &amp; Decision Status</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Real-time alerts whenever a reviewer takes action on your content drafts.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle divide-y divide-[#C4D5E0]/70 overflow-hidden">
          {alerts.map((a, i) => (
            <div key={i} className="p-4 hover:bg-[#F4F8FA] transition-colors flex items-start gap-3.5 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#20364A]">{a.title}</h4>
                  <span className="text-[10px] text-[#4F6576]">{a.time}</span>
                </div>
                <p className="text-[#4F6576] mt-1">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}

