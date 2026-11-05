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
<<<<<<< HEAD
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getClientEnv } from '@/lib/env';
=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  signInDemo: (profile: DemoProfile) => Promise<AuthResult>;
<<<<<<< HEAD
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
=======
  logout: () => void;
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
  const refreshUser = async () => {
    const sessionUser = await authClient.getSession();
    setUser(sessionUser);
  };

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  useEffect(() => {
    let active = true;

    authClient.getSession().then((sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setIsLoading(false);
    });

<<<<<<< HEAD
    const env = getClientEnv();
    if (env.isConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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

  const login = async (email: string, password: string) => {
    const result = await authClient.login(email, password);
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

<<<<<<< HEAD
  const resetPassword = async (email: string) => {
    return authClient.resetPassword(email);
  };

=======
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  return (
<<<<<<< HEAD
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
      }}
    >
=======
    <AuthContext.Provider value={{ user, isLoading, login, register, signInDemo, logout }}>
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
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
