import React from 'react';
import Link from 'next/link';
import styles from './AuthShell.module.css';

interface AuthShellProps {
  variant: 'login' | 'register';
  children: React.ReactNode;
}

const copy = {
  login: {
<<<<<<< HEAD
    badge: 'YOUR BRAND JOURNEY STARTS HERE',
=======
    badge: 'Your brand journey starts here',
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
    badge: 'START YOUR BRAND JOURNEY',
=======
    badge: 'Start your brand journey',
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
<<<<<<< HEAD
      <nav className={styles.nav}>
=======
      <nav className={styles.nav} aria-label="Authentication navigation">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        <Link href="/" className={styles.logo}>
          Brand<span>Sense</span>
        </Link>
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
<<<<<<< HEAD
          <section className={styles.welcomePanel}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeBadge}>
                <span className={styles.badgeDot} />
                {content.badge}
              </div>

              <h1>{content.heading}</h1>
=======
          <section className={styles.welcomePanel} aria-labelledby="auth-welcome-heading">
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeBadge}>
                <span className={styles.badgeDot} aria-hidden="true" />
                {content.badge}
              </div>

              <h1 id="auth-welcome-heading">{content.heading}</h1>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

              <p>{content.description}</p>
            </div>

            <div className={styles.welcomeBottom}>© 2026 BrandSense. All rights reserved.</div>
          </section>

          <section
            className={`${styles.formPanel} ${
              variant === 'login' ? styles.formPanelLogin : ''
            }`}
          >
            {children}
          </section>
        </div>
      </main>
    </div>
  );
};
