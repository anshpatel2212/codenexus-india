'use client';

import React from 'react';
import { RoleDemoPage } from '@/components/auth/RoleDemoPage';

export default function SuperAdminDemoPage() {
  return (
    <RoleDemoPage
      role="Super Admin"
      demoSlug="super-admin"
      roleName="Super Admin"
      personaName="Alexander Vance"
      personaEmail="demo-superadmin@brandsense.ai"
      personaTitle="Global Platform Administrator & Head of Security"
      badgeColor="bg-purple-100 text-purple-800 border-purple-200"
      capabilities={[
        'Full platform-wide visibility across all customer organisations',
        'Provision and suspend customer tenant organisations',
        'Manage global user directory and system-wide roles',
        'Configure primary and fallback AI model parameters & RAG thresholds',
        'Inspect server health, database size, and audit trails',
      ]}
      restrictions={[
        'Changes directly affect global production infrastructure',
        'Audit logs permanently record all super administrative operations',
      ]}
      dashboardPath="/super-admin/dashboard"
      loginPath="/super-admin/login"
    />
  );
}

