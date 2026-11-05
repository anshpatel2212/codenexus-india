'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from '@/components/auth/AuthShell.module.css';

interface RoleLoginPageProps {
  role: 'Super Admin' | 'Admin' | 'Creator' | 'Reviewer';
  demoSlug: 'super-admin' | 'admin' | 'creator' | 'reviewer';
  portalTitle: string;
  portalDescription: string;
  badgeText: string;
  accentColor: string;
  dashboardPath: string;
  demoPath: string;
}

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
  role,
  demoSlug,
  portalTitle,
  portalDescription,
  badgeText,
  accentColor,
  dashboardPath,
  demoPath,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { login, signInDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    // Enforce role boundary at the server level via portalRole parameter
    const result = await login(email, password, role);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast(result.error, 'error');
      return;
    }

    toast(`Authenticated as ${result.user.name} (${result.user.role}).`);
    router.replace(dashboardPath);
  };

  const handleDemoAccess = async () => {
    setError('');
    setLoading(true);
    const result = await signInDemo(demoSlug);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast(result.error, 'error');
      return;
    }

    toast(`Entered ${badgeText} Demo Sandbox.`);
    router.replace(dashboardPath);
  };

  return (
    <AuthShell variant="login">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${accentColor}`}>
            {badgeText}
          </span>
          <Link href="/login" className="text-xs text-[#4F6576] hover:text-[#20364A] font-semibold">
            All Portals
          </Link>
        </div>

        <div className={styles.formHeading}>
          <h2 className="text-xl font-heading font-extrabold text-[#20364A]">{portalTitle}</h2>
          <p className="text-xs text-[#4F6576] mt-1">{portalDescription}</p>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className={styles.formGroup}>
            <label htmlFor="role-email" className="text-xs font-bold text-[#20364A]">Authorized Email</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="role-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'Super Admin' ? 'admin@brandsense.ai' : 'you@company.com'}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role-password" className="text-xs font-bold text-[#20364A]">Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="role-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : `Enter ${badgeText} Portal →`}
          </button>
        </form>

        <div className="pt-4 border-t border-[#C4D5E0]/70 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-[#C4D5E0] bg-[#F4F8FA] hover:bg-[#E5EEF2] text-[#20364A] text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B77938]" />
            Launch Instant {badgeText} Demo Sandbox
          </button>

          <div className="flex items-center justify-between text-xs text-[#4F6576] pt-1">
            <Link href={demoPath} className="hover:underline text-[#416F89] font-semibold">
              Explore Demo Workspace Details →
            </Link>
            <Link href="/forgot-password" className="hover:underline">
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
};

