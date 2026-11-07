'use client';

import React from 'react';
import { RoleDemoPage } from '@/components/auth/RoleDemoPage';

export default function CreatorDemoPage() {
  return (
    <RoleDemoPage
      role="Creator"
      demoSlug="creator"
      roleName="Content Creator"
      personaName="Marcus Vance"
      personaEmail="demo-creator@brandsense.ai"
      personaTitle="Senior Growth Copywriter & Social Lead"
      badgeColor="bg-emerald-100 text-emerald-800 border-emerald-200"
      capabilities={[
        'Draft social media posts, email blasts, ad copy, and press releases',
        'Execute pre-publication AI governance checks against brand guidelines',
        'View highlighted infractions, confidence ratings, and suggested rewrites',
        'Adopt one-click compliant AI suggestions and submit for human sign-off',
        'Track approval progress on personal content drafts',
      ]}
      restrictions={[
        'Cannot edit approved brand rules, facts, or terminology',
        'Cannot approve own content submissions for official publication',
        'Cannot view drafts created by other users',
      ]}
      dashboardPath="/creator/dashboard"
      loginPath="/creator/login"
    />
  );
}

