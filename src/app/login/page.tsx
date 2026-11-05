'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, X, ArrowRight, ShieldCheck, Sparkles, Building2, PenTool, CheckCircle2, Shield } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from '@/components/auth/AuthShell.module.css';

const REMEMBERED_EMAIL_KEY = 'brandsense_remembered_email';

interface DemoPersona {
  roleSlug: 'admin' | 'creator' | 'reviewer' | 'super-admin';
  roleTitle: string;
  name: string;
  title: string;
  department: string;
  description: string;
  badge: string;
  badgeColor: string;
  avatar: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    roleSlug: 'admin',
    roleTitle: 'Organisation Admin',
    name: 'Julian Thorne',
    title: 'Brand Operations Director',
    department: 'BrandSense Demo Corp',
    description: 'Manage brand guidelines, approved facts, terminology rules, team members, and compliance analytics.',
    badge: 'Recommended',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    roleSlug: 'creator',
    roleTitle: 'Content Creator',
    name: 'Marcus Vance',
    title: 'Senior Growth Copywriter',
    department: 'Growth Copywriting & Social',
    description: 'Pre-publication drafting studio with real-time AI compliance verification, automated rule checks, and fix suggestions.',
    badge: 'Creator Studio',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    roleSlug: 'reviewer',
    roleTitle: 'Reviewer / Manager',
    name: 'Sarah Chen, Esq.',
    title: 'Lead Regulatory Counsel',
    department: 'Legal & Regulatory Compliance',
    description: 'Review assigned draft campaigns, inspect AI line-by-line diffs, request changes, or grant formal pre-publication sign-off.',
    badge: 'Compliance Queue',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    roleSlug: 'super-admin',
    roleTitle: 'Super Admin',
    name: 'Alexander Vance',
    title: 'Platform Infrastructure Lead',
    department: 'BrandSense Global Platform',
    description: 'Multi-tenant organization oversight, system health diagnostics, global audit logs, and AI model parameter tuning.',
    badge: 'Platform Root',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, signInDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'email' | 'password' | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  const persistRememberedEmail = (value: string, shouldRemember: boolean) => {
    try {
      if (shouldRemember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, value);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      // Ignore storage errors.
    }
  };

  const routeByRole = (role: string) => {
    if (role === 'Super Admin') {
      router.replace('/super-admin/dashboard');
    } else if (role === 'Admin') {
      router.replace('/admin/dashboard');
    } else if (role === 'Creator') {
      router.replace('/creator/dashboard');
    } else if (role === 'Reviewer' || role === 'Manager') {
      router.replace('/reviewer/dashboard');
    } else {
      router.replace('/dashboard');
    }
  };

  // Immediate single-click login execution
  const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isSubmittingRef.current || loading) {
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.');
      setErrorField('email');
      return;
    }

    if (!password) {
      setError('Enter your password.');
      setErrorField('password');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError('');
    setErrorField(null);

    try {
      const result = await login(cleanEmail, password);
      if (!result.success) {
        setError(result.error);
        setErrorField(result.field === 'email' || result.field === 'password' ? result.field : null);
        toast(result.error, 'error');
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      persistRememberedEmail(cleanEmail, remember);
      toast(`Welcome back, ${result.user.name.split(' ')[0]}.`);
      routeByRole(result.user.role);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleLaunchDemo = async (roleSlug: 'admin' | 'creator' | 'reviewer' | 'super-admin') => {
    setDemoLoadingRole(roleSlug);
    try {
      const result = await signInDemo(roleSlug);
      if (!result.success) {
        toast(result.error, 'error');
        setDemoLoadingRole(null);
        return;
      }

      toast(`Demo initialized: Exploring as ${result.user.role}.`);
      setIsDemoModalOpen(false);
      routeByRole(result.user.role);
    } catch (err: any) {
      toast(err?.message || 'Failed to initialize demo workspace', 'error');
      setDemoLoadingRole(null);
    }
  };

  return (
    <AuthShell variant="login">
      <div className={styles.formHeading}>
        <h2>Welcome back</h2>
        <p>Enter your details to access your account.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert" id="login-error-banner">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errorField === 'email' ? styles.inputError : undefined}
              aria-invalid={errorField === 'email'}
              aria-describedby={errorField === 'email' ? 'login-error-banner' : undefined}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-has-toggle="true"
              className={errorField === 'password' ? styles.inputError : undefined}
              aria-invalid={errorField === 'password'}
              aria-describedby={errorField === 'password' ? 'login-error-banner' : undefined}
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className={styles.formOptions}>
          <label className={styles.remember} htmlFor="remember">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Link href="/forgot-password" className={styles.forgot}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={loading}
          aria-busy={loading}
          onClick={handleLogin}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In →'
          )}
        </button>
      </form>

      <div className={styles.switchText}>
        Don&apos;t have an account? <Link href="/signup">Create an account</Link>
      </div>

      <div className={styles.securityNote}>
        <Lock className="w-3 h-3 text-[#416F89]" aria-hidden="true" />
        <span>Enterprise encrypted authentication.</span>
      </div>

      <div className={styles.divider}>
        <span>or explore without login</span>
      </div>

      {/* Prominent Demo Workspace Action */}
      <button
        type="button"
        onClick={() => setIsDemoModalOpen(true)}
        className={styles.exploreDemoBtn}
      >
        <span className="text-base" aria-hidden="true">🚀</span>
        <span>Explore Demo Workspace</span>
      </button>

      {/* Interactive Demo Workspace Persona Modal */}
      {isDemoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20364A]/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          onClick={() => !demoLoadingRole && setIsDemoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#D5E3EC] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#20364A] to-[#31566D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-[#F4D77B]" />
                </div>
                <div>
                  <h3 id="demo-modal-title" className="text-base font-bold text-white leading-tight">
                    Explore BrandSense Demo Workspace
                  </h3>
                  <p className="text-xs text-white/80">
                    Select any role to experience the interconnected brand governance platform instantly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !demoLoadingRole && setIsDemoModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
                disabled={!!demoLoadingRole}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Persona Grid */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[75vh] overflow-y-auto">
              {DEMO_PERSONAS.map((persona) => {
                const isSelectedLoading = demoLoadingRole === persona.roleSlug;
                return (
                  <button
                    key={persona.roleSlug}
                    type="button"
                    onClick={() => handleLaunchDemo(persona.roleSlug)}
                    disabled={!!demoLoadingRole}
                    className="flex flex-col text-left p-4 rounded-xl border border-[#D5E3EC] bg-[#F8FAFC] hover:bg-white hover:border-[#416F89] hover:shadow-md transition-all group relative disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#20364A] group-hover:text-[#416F89] transition-colors leading-snug">
                            {persona.name}
                          </div>
                          <div className="text-[11px] text-[#718494] font-medium leading-none mt-0.5">
                            {persona.title}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${persona.badgeColor}`}>
                        {persona.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#4F6576] line-clamp-2 mb-3 leading-relaxed">
                      {persona.description}
                    </p>

                    <div className="mt-auto pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#416F89] group-hover:text-[#20364A]">
                      <span>{isSelectedLoading ? 'Entering Workspace...' : `Enter as ${persona.roleTitle}`}</span>
                      {isSelectedLoading ? (
                        <svg className="animate-spin h-3.5 w-3.5 text-[#416F89]" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer Note */}
            <div className="px-6 py-3 bg-[#EDF3F6] border-t border-[#D5E3EC] flex items-center justify-between text-xs text-[#718494]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Interconnected demo organization: <strong>BrandSense Demo Corp</strong>
              </span>
              <span>All changes persist in sandbox session</span>
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
