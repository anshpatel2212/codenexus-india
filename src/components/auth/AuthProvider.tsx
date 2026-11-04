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

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  signInDemo: (profile: DemoProfile) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authClient.getSession().then((sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setIsLoading(false);
    });

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

  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, signInDemo, logout }}>
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
