'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const notifications = user?.isDemo
    ? [
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
      ]
    : [];

  return (
    <RoleShell role="Admin" title="Organisation Governance Alerts">
      <div className="max-w-3xl space-y-4">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Real-Time Notifications</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Stay updated on submission approvals, review alerts, and rule changes.</p>
        </div>

        {notifications.length > 0 ? (
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
        ) : (
          <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EDF3F6] text-[#4F6576] flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-[#718494]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A]">No Notifications</h3>
            <p className="text-xs text-[#4F6576] mt-1 max-w-sm mx-auto">
              You are all caught up! System updates, team activities, and governance alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </RoleShell>
  );
}

