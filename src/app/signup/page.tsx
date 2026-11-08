'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, PenTool, ShieldCheck, Check } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { getDashboardRouteForRole } from '@/services/auth-client';
import styles from '@/components/auth/AuthShell.module.css';

type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'role' | 'terms';
type FieldErrors = Partial<Record<FieldName, string>>;
type SelectableRole = 'Creator' | 'Manager';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<SelectableRole>('Creator');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSubmittingRef = useRef(false);

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

    if (selectedRole !== 'Creator' && selectedRole !== 'Manager') {
      errors.role = 'Please select a valid role (Creator or Manager).';
    }

    if (!termsAccepted) {
      errors.terms = 'Please accept the Terms of Service and Privacy Policy.';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;

    setError('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const result = await register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        organisation: 'BrandSense Workspace',
        role: selectedRole,
      });

      if (!result.success) {
        setLoading(false);
        isSubmittingRef.current = false;
        setError(result.error);
        if (result.field === 'name') {
          setFieldErrors((current) => ({ ...current, fullName: result.error }));
        } else if (result.field === 'email' || result.field === 'password') {
          setFieldErrors((current) => ({ ...current, [result.field as FieldName]: result.error }));
        }
        toast(result.error, 'error');
        return;
      }

      toast(`Account created as ${result.user.role}. Welcome to BrandSense, ${result.user.name.split(' ')[0]}.`);
      // Consistent, single source of truth role redirect
      const destination = getDashboardRouteForRole(result.user.role);
      router.replace(destination);
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      isSubmittingRef.current = false;
      const msg = err?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <AuthShell variant="register">
      <div className={styles.formHeading}>
        <h2>Create account</h2>
        <p>Get started. It only takes a minute.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert" id="register-error-banner">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
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
              aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
              required
            />
          </div>
          {fieldErrors.fullName && (
            <p id="fullName-error" className={styles.fieldError} role="alert">
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        {/* Email */}
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
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              required
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className={styles.fieldError} role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Role Selector: ONLY Creator and Manager */}
        <div className={styles.formGroup}>
          <label id="role-selector-label">Account Role</label>
          <div className={styles.roleSelectorGrid} role="radiogroup" aria-labelledby="role-selector-label">
            {/* Creator Option */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedRole === 'Creator'}
              onClick={() => setSelectedRole('Creator')}
              className={`${styles.roleCard} ${selectedRole === 'Creator' ? styles.roleCardSelected : ''}`}
            >
              <div className={styles.roleCardHeader}>
                <span className={styles.roleCardTitle}>
                  <PenTool className="w-3.5 h-3.5 text-[#416F89]" aria-hidden="true" />
                  Creator
                </span>
                {selectedRole === 'Creator' && (
                  <Check className="w-3.5 h-3.5 text-[#20364A]" aria-hidden="true" />
                )}
              </div>
              <span className={styles.roleCardDesc}>
                Draft &amp; review content with AI checks
              </span>
            </button>

            {/* Manager Option */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedRole === 'Manager'}
              onClick={() => setSelectedRole('Manager')}
              className={`${styles.roleCard} ${selectedRole === 'Manager' ? styles.roleCardSelected : ''}`}
            >
              <div className={styles.roleCardHeader}>
                <span className={styles.roleCardTitle}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#258A70]" aria-hidden="true" />
                  Manager
                </span>
                {selectedRole === 'Manager' && (
                  <Check className="w-3.5 h-3.5 text-[#20364A]" aria-hidden="true" />
                )}
              </div>
              <span className={styles.roleCardDesc}>
                Review queue, approvals &amp; governance
              </span>
            </button>
          </div>
          {fieldErrors.role && (
            <p className={styles.fieldError} role="alert">
              {fieldErrors.role}
            </p>
          )}
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Create a password (min 8 chars)"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-has-toggle="true"
              className={fieldErrors.password ? styles.inputError : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
          {fieldErrors.password && (
            <p id="password-error" className={styles.fieldError} role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
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
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
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
            <p id="confirmPassword-error" className={styles.fieldError} role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms */}
        <label className={styles.terms} htmlFor="terms">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            aria-invalid={Boolean(fieldErrors.terms)}
            aria-describedby={fieldErrors.terms ? 'terms-error' : undefined}
            required
          />
          <span>
            I agree to the <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
        {fieldErrors.terms && (
          <p id="terms-error" className={styles.fieldError} role="alert">
            {fieldErrors.terms}
          </p>
        )}

        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : (
            `Create ${selectedRole} Account →`
          )}
        </button>
      </form>

      <div className={styles.switchText}>
        Already have an account? <Link href="/login">Sign in</Link>
      </div>
    </AuthShell>
  );
}
