'use client';

import React from 'react';
import { RoleDemoPage } from '@/components/auth/RoleDemoPage';

export default function ReviewerDemoPage() {
  return (
    <RoleDemoPage
      role="Reviewer"
      demoSlug="reviewer"
      roleName="Reviewer / Manager"
      personaName="Sarah Chen, Esq."
      personaEmail="demo-reviewer@brandsense.ai"
      personaTitle="Director of Regulatory Compliance & Senior Legal Counsel"
      badgeColor="bg-amber-100 text-amber-800 border-amber-200"
      capabilities={[
        'Review content drafts submitted by marketing and social creators',
        'Verify evidence citations and AI confidence for detected violations',
        'Execute authoritative publication decisions: Approve, Reject, or Request Changes',
        'Add internal compliance commentary and change requests for creators',
        'Audit complete revision history and immutable decision records',
      ]}
      restrictions={[
        'Cannot modify platform-wide AI engine configuration or tenant plans',
        'Cannot bypass organizational brand guideline definitions',
      ]}
      dashboardPath="/reviewer/dashboard"
      loginPath="/reviewer/login"
    />
  );
}

