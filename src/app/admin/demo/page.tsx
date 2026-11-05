'use client';

import React from 'react';
import { RoleDemoPage } from '@/components/auth/RoleDemoPage';

export default function OrgAdminDemoPage() {
  return (
    <RoleDemoPage
      role="Admin"
      demoSlug="admin"
      roleName="Organisation Admin"
      personaName="Julian Thorne"
      personaEmail="demo-admin@brandsense.ai"
      personaTitle="Executive Director of Brand Governance"
      badgeColor="bg-blue-100 text-blue-800 border-blue-200"
      capabilities={[
        'Full authority over organization brand guidelines and tone voice rules',
        'Curate verified brand facts, banned phrases, and legal disclaimers',
        'Invite team members and configure roles (Creators, Reviewers, Managers)',
        'Oversee all departmental reviews and compliance metrics',
        'Configure organization settings and integration webhooks',
      ]}
      restrictions={[
        'Strictly isolated to your own organisation data',
        'Cannot access other tenant organisations or global system settings',
      ]}
      dashboardPath="/admin/dashboard"
      loginPath="/admin/login"
    />
  );
}

