'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import {
  AUTH_STORAGE_KEYS,
  AuthResult,
  DemoProfile,
  RegisterInput,
  authClient,
} from '@/services/auth-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getClientEnv } from '@/lib/env';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string, portalRole?: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  signInDemo: (profile: DemoProfile) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void> | void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const sessionUser = await authClient.getSession();
    setUser(sessionUser);
  };

  useEffect(() => {
    let active = true;

    authClient.getSession().then((sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setIsLoading(false);
    });

    const env = getClientEnv();
    if (env.isConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          if (!active) return;
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (session?.user) {
              const profile = await authClient.fetchUserProfile(session.user.id);
              if (profile) setUser(profile);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        });

        return () => {
          active = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('Supabase auth state listener init warning:', err);
      }
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !AUTH_STORAGE_KEYS.includes(event.key)) return;
      authClient.getSession().then((sessionUser) => setUser(sessionUser));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (email: string, password: string, portalRole?: string) => {
    const result = await authClient.login(email, password, portalRole);
    if (result.success) setUser(result.user);
    return result;
  };

  const register = async (input: RegisterInput) => {
    const result = await authClient.register(input);
    if (result.success) setUser(result.user);
    return result;
  };

  const signInDemo = async (profile: DemoProfile) => {
    const result = await authClient.signInDemo(profile);
    if (result.success) setUser(result.user);
    return result;
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) return null;
    const updated = await authClient.updateUserProfile(user.id, updates);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  const resetPassword = async (email: string) => {
    return authClient.resetPassword(email);
  };

  const logout = async () => {
    await authClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        signInDemo,
        resetPassword,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
