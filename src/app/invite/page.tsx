'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import { Button } from '@/components/ui/Button';
import { Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function InvitePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAccept = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast('Workspace invitation accepted! Redirecting to dashboard...');
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="bs-app-shell min-h-screen flex items-center justify-center p-6 antialiased font-sans">
      <main className="bs-glass max-w-md w-full rounded-xl border border-[#C4D5E0] p-8 sm:p-10 text-center shadow-card">
        <BrandSenseLogo className="justify-center mb-6" />

        <div className="w-12 h-12 rounded-lg bg-[#D5E3EC]/70 text-[#416F89] border border-[#C4D5E0] flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <Building2 className="w-6 h-6" />
        </div>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#D5E3EC]/80 text-[#20364A] text-xs font-bold uppercase tracking-wider">
          Workspace Invitation
        </span>

        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#20364A] mt-3 tracking-tight">
          Join Acme Enterprise Holdings
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-[#4F6576] leading-relaxed">
          <strong className="text-[#20364A]">Julian Thorne</strong> (Chief Compliance Officer) has
          invited you to collaborate as an authorized{' '}
          <strong className="text-[#20364A]">Content Reviewer</strong> on BrandSense.
        </p>

        <div className="my-6 p-4 rounded-lg bg-[#F4F8FA] border border-[#C4D5E0] text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center gap-3">
            <span className="text-[#4F6576]">Invited email</span>
            <span className="font-semibold text-[#20364A] truncate">elena.rostova@acmebrand.com</span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-[#4F6576]">Assigned role</span>
            <span className="font-semibold text-[#20364A]">Brand Manager / Reviewer</span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-[#4F6576]">Clearance</span>
            <span className="font-semibold text-[#20364A]">Level 3 (Pre-publication)</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleAccept} isLoading={loading} className="w-full" size="lg">
            Accept Invitation &amp; Launch Workspace
            <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
          </Button>

          <Link
            href="/login"
            className="block w-full py-2 text-xs text-[#4F6576] hover:text-[#20364A] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
          >
            Sign in with a different account
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-[#C4D5E0] flex items-center justify-center gap-2 text-xs text-[#4F6576]">
          <ShieldCheck className="w-4 h-4 text-[#1F7560]" aria-hidden="true" />
          <span>Protected by Enterprise SAML 2.0 &amp; SOC 2</span>
        </div>
      </main>
    </div>
  );
}
