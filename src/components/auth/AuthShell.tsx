import React from 'react';
import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import styles from './AuthShell.module.css';

interface AuthShellProps {
  variant: 'login' | 'register';
  children: React.ReactNode;
}

const copy = {
  login: {
    badge: 'Your brand journey starts here',
    heading: (
      <>
        Think better.
        <br />
        Build a <span>stronger</span>
        <br />
        brand.
      </>
    ),
    description:
      'Welcome to BrandSense. Your workspace for understanding, managing and growing your brand with confidence.',
  },
  register: {
    badge: 'Start your brand journey',
    heading: (
      <>
        Make your
        <br />
        brand <span>stand out.</span>
      </>
    ),
    description:
      'Create your BrandSense account and discover smarter ways to understand, manage and grow your brand.',
  },
} as const;

export const AuthShell: React.FC<AuthShellProps> = ({ variant, children }) => {
  const content = copy[variant];

  return (
    <div
      className={`${styles.page} ${
        variant === 'login' ? styles.pageLogin : styles.pageRegister
      }`}
    >
      <nav className={styles.nav} aria-label="Authentication navigation">
        <BrandSenseLogo />
        <Link href="/" className={styles.navLink}>
          ← Back to Home
        </Link>
      </nav>

      <main className={`${styles.main} ${variant === 'login' ? styles.loginMain : ''}`}>
        <div
          className={`${styles.wrapper} ${
            variant === 'login' ? styles.loginWrapper : styles.registerWrapper
          }`}
        >
          <section className={styles.welcomePanel} aria-labelledby="auth-welcome-heading">
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {content.badge}
              </div>

              <h1 id="auth-welcome-heading">{content.heading}</h1>

              <p>{content.description}</p>
            </div>

            <div className={styles.welcomeBottom}>
              <div className="text-[11px] text-white/60">© 2026 BrandSense. All rights reserved.</div>
            </div>
          </section>

          <section
            className={`${styles.formPanel} ${
              variant === 'login' ? styles.formPanelLogin : ''
            }`}
          >
            {children}
          </section>
        </div>

        {/* Copyright visible on mobile/smaller screens where welcomePanel bottom is hidden */}
        <div className="w-full max-w-[480px] mt-5 pb-4 flex items-center justify-center md:hidden text-center">
          <div className="text-[11px] text-[#718494] font-medium">© 2026 BrandSense. All rights reserved.</div>
        </div>
      </main>
    </div>
  );
};
