'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import styles from '@/components/auth/AuthShell.module.css';

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'terms';

type FieldErrors = Partial<Record<FieldName, string>>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (fullName.trim().length < 2) {
      errors.fullName = 'Enter your full name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      errors.terms = 'Please accept the Terms of Service and Privacy Policy.';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    const result = await register({
      name: fullName,
      email,
      password,
      organisation: 'BrandSense Workspace',
      role: 'Brand Manager',
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      if (result.field === 'name') {
        setFieldErrors((current) => ({ ...current, fullName: result.error }));
      } else if (result.field === 'email' || result.field === 'password') {
        setFieldErrors((current) => ({ ...current, [result.field as FieldName]: result.error }));
      }
      toast(result.error, 'error');
      return;
    }

    toast(`Account created. Welcome to BrandSense, ${result.user.name.split(' ')[0]}.`);
    router.replace('/dashboard');
  };

  return (
    <AuthShell variant="register">
      <div className={styles.formHeading}>
        <h2>Create account</h2>
        <p>Get started. It only takes a minute.</p>
      </div>

      {error && (
<<<<<<< HEAD
        <div className={styles.errorBanner} role="alert">
          <AlertCircle className="w-3.5 h-3.5" />
=======
        <div className={styles.errorBanner} role="alert" id="register-error-banner">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldErrors.fullName ? styles.inputError : undefined}
              aria-invalid={Boolean(fieldErrors.fullName)}
<<<<<<< HEAD
              required
            />
          </div>
          {fieldErrors.fullName && <p className={styles.fieldError}>{fieldErrors.fullName}</p>}
=======
              aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
              required
            />
          </div>
          {fieldErrors.fullName && (
            <p id="fullName-error" className={styles.fieldError} role="alert">
              {fieldErrors.fullName}
            </p>
          )}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        </div>

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
              className={fieldErrors.email ? styles.inputError : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
<<<<<<< HEAD
              required
            />
          </div>
          {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
=======
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className={styles.fieldError} role="alert">
              {fieldErrors.email}
            </p>
          )}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-has-toggle="true"
              className={fieldErrors.password ? styles.inputError : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
<<<<<<< HEAD
=======
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
          {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
=======
          {fieldErrors.password && (
            <p id="password-error" className={styles.fieldError} role="alert">
              {fieldErrors.password}
            </p>
          )}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-has-toggle="true"
              className={fieldErrors.confirmPassword ? styles.inputError : undefined}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
<<<<<<< HEAD
=======
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              required
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
<<<<<<< HEAD
            <p className={styles.fieldError}>{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <label className={styles.terms}>
=======
            <p id="confirmPassword-error" className={styles.fieldError} role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <label className={styles.terms} htmlFor="terms">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-invalid={Boolean(fieldErrors.terms)}
<<<<<<< HEAD
=======
            aria-describedby={fieldErrors.terms ? 'terms-error' : undefined}
            required
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
          />
          <span>
            I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
<<<<<<< HEAD
        {fieldErrors.terms && <p className={styles.fieldError}>{fieldErrors.terms}</p>}
=======
        {fieldErrors.terms && (
          <p id="terms-error" className={styles.fieldError} role="alert">
            {fieldErrors.terms}
          </p>
        )}
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

        <button type="submit" className={styles.primaryBtn} disabled={loading} aria-busy={loading}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>

      <div className={`${styles.switchText}`}>
        Already have an account? <Link href="/login">Sign in</Link>
      </div>
    </AuthShell>
  );
}
