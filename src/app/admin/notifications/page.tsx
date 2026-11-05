'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';

export default function AdminNotificationsPage() {
  const notifications = [
    {
      title: 'Automated Guideline Sync Complete',
      desc: 'All 14 active brand rules re-indexed into the RAG vector store.',
      time: '10 minutes ago',
      type: 'system',
    },
    {
      title: 'New Content Submission from Creator',
      desc: 'Marcus Vance submitted "Q3 Product Announcement — Email Blast" for review.',
      time: '1 hour ago',
      type: 'submission',
    },
    {
      title: 'Legal Sign-Off Recorded',
      desc: 'Sarah Chen signed off on ESG Annual Disclosure with zero changes.',
      time: '3 hours ago',
      type: 'approval',
    },
  ];

  return (
    <RoleShell role="Admin" title="Organisation Governance Alerts">
      <div className="max-w-3xl space-y-4">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Real-Time Notifications</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Stay updated on submission approvals, review alerts, and rule changes.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle divide-y divide-[#C4D5E0]/70 overflow-hidden">
          {notifications.map((n, i) => (
            <div key={i} className="p-4 hover:bg-[#F4F8FA] transition-colors flex items-start gap-3.5 text-xs">
              <div className="p-2 rounded-lg bg-blue-50 text-[#416F89] mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#20364A]">{n.title}</h4>
                  <span className="text-[10px] text-[#4F6576]">{n.time}</span>
                </div>
                <p className="text-[#4F6576] mt-1">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}

