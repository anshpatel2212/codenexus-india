'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Lock, User, FileText, CheckSquare, Settings } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

interface RoleDemoPageProps {
  role: 'Super Admin' | 'Admin' | 'Creator' | 'Reviewer';
  demoSlug: 'super-admin' | 'admin' | 'creator' | 'reviewer';
  roleName: string;
  personaName: string;
  personaEmail: string;
  personaTitle: string;
  badgeColor: string;
  capabilities: string[];
  restrictions: string[];
  dashboardPath: string;
  loginPath: string;
}

export const RoleDemoPage: React.FC<RoleDemoPageProps> = ({
  role,
  demoSlug,
  roleName,
  personaName,
  personaEmail,
  personaTitle,
  badgeColor,
  capabilities,
  restrictions,
  dashboardPath,
  loginPath,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { signInDemo } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLaunchDemo = async () => {
    setLoading(true);
    const result = await signInDemo(demoSlug);
    setLoading(false);

    if (!result.success) {
      toast(result.error, 'error');
      return;
    }

    toast(`Demo session launched as ${personaName}.`);
    router.replace(dashboardPath);
  };

  return (
    <AuthShell variant="login">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeColor}`}>
            {roleName} Sandbox
          </span>
          <Link href="/login" className="text-xs text-[#4F6576] hover:text-[#20364A] font-semibold">
            All Portals
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-heading font-extrabold text-[#20364A]">
            {roleName} Interactive Demo
          </h2>
          <p className="text-xs text-[#4F6576] mt-1">
            Experience the BrandSense governance platform configured specifically for this role.
          </p>
        </div>

        {/* Persona Card */}
        <div className="p-3.5 rounded-xl bg-[#F4F8FA] border border-[#C4D5E0] space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#20364A] text-white flex items-center justify-center font-bold text-sm">
              {personaName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-xs font-bold text-[#20364A]">{personaName}</p>
              <p className="text-[11px] text-[#4F6576]">{personaTitle}</p>
              <p className="text-[10px] text-[#416F89] font-mono">{personaEmail}</p>
            </div>
          </div>
        </div>

        {/* Role Capabilities */}
        <div className="space-y-2 text-xs">
          <p className="font-bold text-[#20364A] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7560]" />
            <span>Key Role Capabilities:</span>
          </p>
          <ul className="space-y-1 pl-5 list-disc text-[#4F6576] text-[11px]">
            {capabilities.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        {/* Access Restrictions */}
        <div className="space-y-2 text-xs">
          <p className="font-bold text-[#A94842] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Strict RBAC Restrictions:</span>
          </p>
          <ul className="space-y-1 pl-5 list-disc text-[#4F6576] text-[11px]">
            {restrictions.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Launch Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center"
          isLoading={loading}
          onClick={handleLaunchDemo}
          leftIcon={<Sparkles className="w-4 h-4 text-[#F4D77B]" />}
        >
          Launch {roleName} Demo Workspace →
        </Button>

        <div className="text-center text-xs text-[#4F6576] pt-1">
          Have an assigned corporate account?{' '}
          <Link href={loginPath} className="text-[#416F89] font-bold hover:underline">
            Sign in with credentials
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

