'use client';

import React from 'react';
import { Bell, Clock, CheckCircle2 } from 'lucide-react';
import { RoleShell } from '@/components/layout/RoleShell';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ReviewerNotificationsPage() {
  const { user } = useAuth();
  const alerts = user?.isDemo
    ? [
        {
          title: 'New High-Priority Submission',
          desc: 'Marcus Vance routed "Q3 Product Announcement" to your review queue.',
          time: '25 mins ago',
        },
        {
          title: 'Review SLA Reminder',
          desc: '1 draft awaiting approval is approaching 4-hour turnaround threshold.',
          time: '2 hours ago',
        },
      ]
    : [];

  return (
    <RoleShell role="Reviewer" title="Reviewer Queue Alerts">
      <div className="max-w-3xl space-y-4">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">Queue Alerts &amp; Submissions</h2>
          <p className="text-xs text-[#4F6576] mt-0.5">Real-time alerts for newly routed marketing copy and urgent requests.</p>
        </div>

        {alerts.length > 0 ? (
          <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle divide-y divide-[#C4D5E0]/70 overflow-hidden">
            {alerts.map((a, i) => (
              <div key={i} className="p-4 hover:bg-[#F4F8FA] transition-colors flex items-start gap-3.5 text-xs">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 mt-0.5">
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
        ) : (
          <div className="bg-white rounded-xl border border-[#C4D5E0] shadow-subtle p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#EDF3F6] text-[#4F6576] flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-[#718494]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#20364A]">No Pending Alerts</h3>
            <p className="text-xs text-[#4F6576] mt-1 max-w-sm mx-auto">
              Your review queue has no new unread notifications. Newly routed submissions and compliance alerts will appear here.
            </p>
          </div>
        )}
      </div>
    </RoleShell>
  );
}

