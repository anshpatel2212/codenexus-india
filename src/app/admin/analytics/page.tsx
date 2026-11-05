'use client';

import React from 'react';
import { RoleShell } from '@/components/layout/RoleShell';
import InsightsPage from '@/app/insights/page';

export default function AdminAnalyticsPage() {
  return (
    <RoleShell role="Admin" title="Governance &amp; Compliance Analytics">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-[#C4D5E0] shadow-subtle">
          <h2 className="font-heading font-extrabold text-base text-[#20364A]">
            Organisation Quality &amp; Risk Metrics
          </h2>
          <p className="text-xs text-[#4F6576] mt-0.5">
            Cross-departmental compliance telemetry, recurrent violation trends, and turnaround speeds.
          </p>
        </div>

        {/* Embedded Analytics Content */}
        <div className="bg-white p-6 rounded-xl border border-[#C4D5E0] shadow-subtle space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0]">
              <span className="text-[#4F6576] font-bold">First-Pass Approval Rate</span>
              <p className="font-heading text-2xl font-extrabold text-[#1F7560] mt-1">92.4%</p>
              <p className="text-[10px] text-[#4F6576] mt-0.5">Passes pre-publication checks without rework</p>
            </div>
            <div className="p-4 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0]">
              <span className="text-[#4F6576] font-bold">Average Legal Review Turnaround</span>
              <p className="font-heading text-2xl font-extrabold text-[#20364A] mt-1">2.4 hrs</p>
              <p className="text-[10px] text-[#1F7560] font-bold mt-0.5">68% faster than email workflows</p>
            </div>
            <div className="p-4 bg-[#F4F8FA] rounded-lg border border-[#C4D5E0]">
              <span className="text-[#4F6576] font-bold">Unsubstantiated Claims Prevented</span>
              <p className="font-heading text-2xl font-extrabold text-[#A94842] mt-1">100%</p>
              <p className="text-[10px] text-[#4F6576] mt-0.5">Zero unverified ROI claims published</p>
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}

