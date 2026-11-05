'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from '@/components/auth/AuthShell.module.css';

const REMEMBERED_EMAIL_KEY = 'brandsense_remembered_email';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorField(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      setErrorField('email');
      return;
    }

    if (!password) {
      setError('Enter your password.');
      setErrorField('password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setErrorField(result.field === 'email' || result.field === 'password' ? result.field : null);
      toast(result.error, 'error');
      return;
    }

    persistRememberedEmail(email.trim(), remember);
    toast(`Welcome back, ${result.user.name.split(' ')[0]}.`);
    router.replace('/dashboard');
  };

  const handleDemoLogin = async () => {
    setError('');
    setErrorField(null);
    setLoading(true);
    const result = await signInDemo('manager');
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast(result.error, 'error');
      return;
    }

    toast('Signed in with the demo account.');
    router.replace('/dashboard');
  };

  return (
    <AuthShell variant="login">
      <div className={styles.formHeading}>
        <h2>Welcome back</h2>
        <p>Enter your details to access your account.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle className="w-3.5 h-3.5" />
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
          <label className={styles.remember}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>

          <Link href="/forgot-password" className={styles.forgot}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>

      <div className={styles.switchText}>
        Don&apos;t have an account? <Link href="/register">Create an account</Link>
      </div>

      <div className={styles.securityNote}>
        <Lock />
        Your account and data are securely protected.
      </div>

      <div className={styles.demoRow}>
        <span>Just exploring?</span>
        <button
          type="button"
          className={styles.demoButton}
          onClick={handleDemoLogin}
          disabled={loading}
        >
          Use the demo account
        </button>
      </div>
    </AuthShell>
  );
}
