'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div
        className="min-h-screen bg-[#EDF3F6] flex flex-col items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span className="w-10 h-10 rounded-xl bg-[#20364A] text-white flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#F4D77B]" />
        </span>
        <p className="text-xs font-bold text-[#526B7C]">
          {isLoading ? 'Checking your session...' : 'Redirecting to sign in...'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
