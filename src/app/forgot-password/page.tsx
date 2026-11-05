'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BrandSenseLogo } from '@/components/ui/BrandSenseLogo';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast('Recovery link sent to your work email');
    }, 500);
  };

  return (
    <div className="bs-app-shell min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 antialiased font-sans">
      <div className="w-full max-w-md mx-auto">
        <BrandSenseLogo />

        <div className="mt-10">
          <Link
            href="/login"
<<<<<<< HEAD
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718494] hover:text-[#20364A] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
=======
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F6576] hover:text-[#20364A] mb-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            <span>Back to sign in</span>
          </Link>

          <span className="bs-eyebrow block mb-1.5">Account recovery</span>
          <h1 className="font-heading text-2xl sm:text-[28px] font-extrabold text-[#20364A] tracking-tight">
            Reset your password
          </h1>
<<<<<<< HEAD
          <p className="mt-2 text-sm text-[#718494]">
=======
          <p id="reset-email-help" className="mt-2 text-sm text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            Enter the email tied to your BrandSense seat and we&apos;ll send a secure reset link.
          </p>
        </div>

        {submitted ? (
<<<<<<< HEAD
          <div className="bs-glass mt-8 p-6 rounded-xl border border-[#C4D5E0] text-center">
            <CheckCircle2 className="w-10 h-10 text-[#258A70] mx-auto mb-3" />
            <h3 className="font-heading text-sm font-bold text-[#20364A]">Check your inbox</h3>
            <p className="mt-1.5 text-xs text-[#718494]">
              We sent an encrypted recovery link to <strong className="text-[#20364A]">{email}</strong>.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#416F89] hover:bg-[#315C74] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Return to Login
=======
          <div className="bs-glass mt-8 p-6 rounded-xl border border-[#C4D5E0] text-center" role="status">
            <CheckCircle2 className="w-10 h-10 text-[#1F7560] mx-auto mb-3" aria-hidden="true" />
            <h2 className="font-heading text-sm font-bold text-[#20364A]">Check your inbox</h2>
            <p className="mt-1.5 text-xs text-[#4F6576]">
              We sent an encrypted recovery link to <strong className="text-[#20364A]">{email}</strong>.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Return to Login
                </Button>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bs-glass mt-8 space-y-4 rounded-xl border border-[#C4D5E0] p-6 sm:p-8">
            <div>
              <label htmlFor="reset-email" className="bs-label">
                Work Email Address
              </label>
              <div className="relative">
<<<<<<< HEAD
                <Mail className="w-4 h-4 text-[#718494] absolute left-3 top-1/2 -translate-y-1/2" />
=======
                <Mail className="w-4 h-4 text-[#4F6576] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
<<<<<<< HEAD
=======
                  aria-describedby="reset-email-help"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
                  className="bs-input pl-9"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full mt-2" size="lg">
              Send Password Reset Link
            </Button>
          </form>
        )}
      </div>

<<<<<<< HEAD
      <div className="w-full max-w-md mx-auto mt-10 text-center text-xs text-[#718494]">
=======
      <div className="w-full max-w-md mx-auto mt-10 text-center text-xs text-[#4F6576]">
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        © 2026 BrandSense Technologies Inc. SOC 2 Type II Certified.
      </div>
    </div>
  );
}
