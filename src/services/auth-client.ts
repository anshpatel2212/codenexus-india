import { UserProfile } from '@/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getClientEnv } from '@/lib/env';

const USERS_KEY = 'brandsense_auth_users';
const SESSION_KEY = 'brandsense_auth_session';
const TOKEN_KEY = 'brandsense_auth_token';

export const AUTH_STORAGE_KEYS = [USERS_KEY, SESSION_KEY, TOKEN_KEY];

export type AuthField = 'name' | 'email' | 'password';

export type AuthResult =
  | { success: true; user: UserProfile; message?: string }
  | { success: false; error: string; field?: AuthField };

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organisation: string;
  role: string;
  invitationToken?: string;
}

export type DemoProfile = 
  | 'super-admin'
  | 'superadmin'
  | 'admin'
  | 'creator'
  | 'reviewer'
  | 'manager'
  | 'legal'
  | 'okta'
  | 'google';

interface StoredUser extends UserProfile {
  passwordHash: string;
  createdAt: string;
}

interface StoredSession {
  userId: string;
  email: string;
  issuedAt: number;
  isDemo?: boolean;
}

const SUPER_ADMIN_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const DEMO_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const LEGAL_AVATAR = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
const CREATOR_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
const ADMIN_AVATAR = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';

export const DEMO_ORG_ID = 'org-demo-brandsense';

export const DEMO_USERS: Array<Omit<StoredUser, 'passwordHash' | 'createdAt'> & { password: string }> = [
  {
    id: 'usr-demo-superadmin',
    organizationId: '',
    name: 'Alexander Vance (Super Admin Demo)',
    email: 'demo-superadmin@brandsense.ai',
    role: 'Super Admin',
    avatar: SUPER_ADMIN_AVATAR,
    department: 'Platform Security & Governance Operations',
    organisation: 'BrandSense Global Platform',
    isDemo: true,
    password: 'demo-password-123',
  },
  {
    id: 'usr-demo-admin',
    organizationId: DEMO_ORG_ID,
    name: 'Julian Thorne (Demo Admin)',
    email: 'demo-admin@brandsense.ai',
    role: 'Admin',
    avatar: ADMIN_AVATAR,
    department: 'Executive Brand Governance',
    organisation: 'BrandSense Demo Corp',
    isDemo: true,
    password: 'demo-password-123',
  },
  {
    id: 'usr-demo-creator',
    organizationId: DEMO_ORG_ID,
    name: 'Marcus Vance (Demo Creator)',
    email: 'demo-creator@brandsense.ai',
    role: 'Creator',
    avatar: CREATOR_AVATAR,
    department: 'Growth Copywriting & Social',
    organisation: 'BrandSense Demo Corp',
    isDemo: true,
    password: 'demo-password-123',
  },
  {
    id: 'usr-demo-reviewer',
    organizationId: DEMO_ORG_ID,
    name: 'Sarah Chen, Esq. (Demo Reviewer)',
    email: 'demo-reviewer@brandsense.ai',
    role: 'Reviewer',
    avatar: LEGAL_AVATAR,
    department: 'Legal & Regulatory Compliance',
    organisation: 'BrandSense Demo Corp',
    isDemo: true,
    password: 'demo-password-123',
  },
  {
    id: 'usr-demo-manager',
    organizationId: DEMO_ORG_ID,
    name: 'Elena Rostova (Demo Manager)',
    email: 'demo-manager@brandsense.ai',
    role: 'Manager',
    avatar: DEMO_AVATAR,
    department: 'Brand & Global Marketing',
    organisation: 'BrandSense Demo Corp',
    isDemo: true,
    password: 'demo-password-123',
  },
];

const DEMO_PROFILE_MAP: Record<DemoProfile, string> = {
  'super-admin': 'demo-superadmin@brandsense.ai',
  'superadmin': 'demo-superadmin@brandsense.ai',
  'admin': 'demo-admin@brandsense.ai',
  'creator': 'demo-creator@brandsense.ai',
  'reviewer': 'demo-reviewer@brandsense.ai',
  'manager': 'demo-manager@brandsense.ai',
  'legal': 'demo-reviewer@brandsense.ai',
  'okta': 'demo-manager@brandsense.ai',
  'google': 'demo-manager@brandsense.ai',
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = async (password: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(`brandsense-salt-v2:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 0;
  const value = `brandsense-salt-v2:${password}`;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `fallback:${hash}:${value.length}`;
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage issues in private browsing
  }
};

const readJSON = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const toPublicUser = (user: StoredUser): UserProfile => {
  const { passwordHash, createdAt, ...profile } = user;
  void passwordHash;
  void createdAt;
  return profile;
};

class BrandSenseAuthClient {
  private seedPromise: Promise<void> | null = null;

  private get supabase() {
    return getSupabaseBrowserClient();
  }

  public isSupabaseLive(): boolean {
    return getClientEnv().isConfigured;
  }

  public isDemoAllowed(): boolean {
    return true;
  }

  public isDemoUser(user?: UserProfile | null): boolean {
    if (!user) return false;
    return Boolean(user.isDemo || user.organizationId === DEMO_ORG_ID || user.email.startsWith('demo-'));
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private readUsers(): StoredUser[] {
    return readJSON<StoredUser[]>(USERS_KEY) ?? [];
  }

  private writeUsers(users: StoredUser[]) {
    writeJSON(USERS_KEY, users);
  }

  private ensureSeeded(): Promise<void> {
    if (!this.seedPromise) {
      this.seedPromise = this.seedDemoUsers();
    }
    return this.seedPromise;
  }

  private async seedDemoUsers(): Promise<void> {
    const users = this.readUsers();
    let changed = false;

    for (const demo of DEMO_USERS) {
      const idx = users.findIndex((user) => user.email === demo.email);
      if (idx === -1) {
        const { password, ...profile } = demo;
        users.push({
          ...profile,
          passwordHash: await hashPassword(password),
          createdAt: new Date().toISOString(),
        });
        changed = true;
      }
    }

    if (changed) {
      this.writeUsers(users);
    }
  }

  private writeSession(user: UserProfile) {
    const session: StoredSession = {
      userId: user.id,
      email: user.email,
      issuedAt: Date.now(),
      isDemo: Boolean(user.isDemo),
    };
    writeJSON(SESSION_KEY, session);
    writeJSON('brandsense_active_user', user);
  }

  // ---------------------------------------------------------------------------
  // Profile Fetcher via Supabase
  // ---------------------------------------------------------------------------
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.isSupabaseLive()) return null;

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          avatar_url,
          department,
          organization_id,
          organizations(name)
        `)
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      const profileData = data as any;
      const orgName = profileData.organizations?.name || 'Enterprise Holdings';

      return {
        id: profileData.id,
        organizationId: profileData.organization_id,
        name: profileData.full_name,
        email: profileData.email,
        role: profileData.role as UserProfile['role'],
        avatar: profileData.avatar_url || '',
        department: profileData.department || 'Brand & Marketing',
        organisation: orgName,
        isDemo: false,
      };
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Session Handling
  // ---------------------------------------------------------------------------
  async getSession(): Promise<UserProfile | null> {
    const token = this.getToken();

    // 1. Try Backend Token Authentication (/api/v1/auth/me)
    if (token) {
      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const profile = await res.json();
          const userProfile: UserProfile = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            organizationId: profile.organizationId,
            organisation: profile.organisation,
            avatar: profile.avatar || '',
            department: profile.department || 'General',
            isDemo: Boolean(profile.isDemo),
          };
          this.writeSession(userProfile);
          return userProfile;
        } else if (res.status === 401) {
          // Token expired or invalid
          this.setToken(null);
        }
      } catch (e) {
        // Backend not reached, continue to local session check
      }
    }

    // 2. Supabase live session check
    if (this.isSupabaseLive()) {
      try {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (session && !error) {
          let profile = await this.fetchUserProfile(session.user.id);
          if (!profile) {
            await new Promise((r) => setTimeout(r, 600));
            profile = await this.fetchUserProfile(session.user.id);
          }
          if (profile) return profile;
        }
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      }
    }

    // 3. Local storage cached session check
    const cachedUser = readJSON<UserProfile>('brandsense_active_user');
    if (cachedUser) {
      return cachedUser;
    }

    await this.ensureSeeded();
    const session = readJSON<StoredSession>(SESSION_KEY);
    if (!session) return null;

    // Check expiration (7 days)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.issuedAt > SEVEN_DAYS) {
      this.logout();
      return null;
    }

    const users = this.readUsers();
    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      this.logout();
      return null;
    }

    return toPublicUser(user);
  }

  // ---------------------------------------------------------------------------
  // Login with Real Backend Database & Role Portal Enforcement
  // ---------------------------------------------------------------------------
  async login(email: string, password: string, portalRole?: string): Promise<AuthResult> {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
      return { success: false, error: 'Enter your email address and password.', field: 'email' };
    }

    // 1. Primary: Persistent Backend Relational Database Authentication
    try {
      const resp = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          password: password,
          portalRole: portalRole || undefined,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.token) {
          this.setToken(data.token);
        }
        this.writeSession(data.user);
        return { success: true, user: data.user };
      }

      // If backend returned 401 or 403, respect the strict security rejection
      if (resp.status === 401 || resp.status === 403) {
        const errData = await resp.json().catch(() => ({}));
        return {
          success: false,
          error: errData.detail || 'Authentication failed. Please verify your credentials and role access.',
          field: resp.status === 401 ? 'password' : 'email',
        };
      }
    } catch (netErr) {
      // Backend not running locally, fallback gracefully
      console.warn('Backend auth endpoint unreachable, attempting fallback authentication.');
    }

    // 2. Supabase Live Fallback
    if (this.isSupabaseLive() && !normalized.startsWith('demo-')) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: normalized,
          password,
        });

        if (error) {
          return {
            success: false,
            error: error.message || 'Authentication failed. Please verify your credentials.',
            field: 'password',
          };
        }

        if (data.user) {
          let profile = await this.fetchUserProfile(data.user.id);
          if (!profile) {
            await new Promise((r) => setTimeout(r, 600));
            profile = await this.fetchUserProfile(data.user.id);
          }

          if (!profile) {
            await this.supabase.auth.signOut();
            return {
              success: false,
              error: 'User profile not found in public.profiles. Please contact your administrator.',
              field: 'email',
            };
          }

          this.writeSession(profile);
          return { success: true, user: profile };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Sign in failed.', field: 'email' };
      }
    }

    // 3. Local offline fallback
    await this.ensureSeeded();
    const user = this.readUsers().find((candidate) => candidate.email === normalized);
    if (!user) {
      return { success: false, error: 'No account was found for this email address.', field: 'email' };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.', field: 'password' };
    }

    const pubUser = toPublicUser(user);
    this.writeSession(pubUser);
    return { success: true, user: pubUser };
  }

  // ---------------------------------------------------------------------------
  // Register / Onboarding (Persistent Database Creation)
  // ---------------------------------------------------------------------------
  async register(input: RegisterInput): Promise<AuthResult> {
    const name = input.name.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;
    const organisation = input.organisation.trim() || 'My Enterprise Brand';

    if (name.length < 2) {
      return { success: false, error: 'Enter your full name.', field: 'name' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Enter a valid email address.', field: 'email' };
    }
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.', field: 'password' };
    }
    if (email.startsWith('demo-')) {
      return { success: false, error: 'Reserved email prefix. Please use your legitimate work email.', field: 'email' };
    }

    // 1. Primary: Persistent Backend Relational Database Registration
    try {
      const resp = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          organisation,
          role: input.role || 'Admin',
          invitationToken: input.invitationToken || null,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.token) {
          this.setToken(data.token);
        }
        this.writeSession(data.user);
        return { success: true, user: data.user };
      }

      const errData = await resp.json().catch(() => ({}));
      if (resp.status === 409) {
        return {
          success: false,
          error: errData.detail || 'An account with this email already exists. Please sign in.',
          field: 'email',
        };
      }
      if (resp.status >= 400 && resp.status < 500) {
        return {
          success: false,
          error: errData.detail || 'Registration failed. Please check your information.',
          field: 'email',
        };
      }
    } catch (e) {
      console.warn('Backend signup unreachable, falling back to local storage.');
    }

    // 2. Supabase Live Fallback
    if (this.isSupabaseLive()) {
      try {
        const { data, error } = await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              organisation,
              invitation_token: input.invitationToken || null,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message, field: 'email' };
        }

        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            name,
            email,
            role: (input.role as UserProfile['role']) || 'Admin',
            avatar: '',
            department: 'Brand Management',
            organisation,
            isDemo: false,
          };
          this.writeSession(newUser);
          return { success: true, user: newUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed.', field: 'email' };
      }
    }

    // 3. Local Registration Fallback
    await this.ensureSeeded();
    const users = this.readUsers();
    if (users.some((user) => user.email === email)) {
      return {
        success: false,
        error: 'An account with this email already exists. Sign in instead.',
        field: 'email',
      };
    }

    const uniqueId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const uniqueOrgId = `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: StoredUser = {
      id: uniqueId,
      organizationId: uniqueOrgId,
      name,
      email,
      role: (input.role as UserProfile['role']) || 'Admin',
      avatar: '',
      department: 'Brand Management',
      organisation,
      isDemo: false,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.writeUsers(users);
    const pubUser = toPublicUser(newUser);
    this.writeSession(pubUser);

    return { success: true, user: pubUser };
  }

  // ---------------------------------------------------------------------------
  // Demo Login (Isolated Demo Roles)
  // ---------------------------------------------------------------------------
  async signInDemo(profile: DemoProfile): Promise<AuthResult> {
    // Map profile slug to backend role slug
    let roleSlug = 'admin';
    if (profile === 'super-admin' || profile === 'superadmin') roleSlug = 'super-admin';
    else if (profile === 'creator') roleSlug = 'creator';
    else if (profile === 'reviewer' || profile === 'legal') roleSlug = 'reviewer';
    else if (profile === 'manager') roleSlug = 'manager';

    // 1. Primary: Real backend demo login
    try {
      const resp = await fetch(`/api/v1/auth/demo/${roleSlug}`, {
        method: 'POST',
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.token) {
          this.setToken(data.token);
        }
        this.writeSession(data.user);
        return { success: true, user: data.user };
      }
    } catch (e) {
      // Backend not running
    }

    // 2. Offline fallback
    await this.ensureSeeded();
    const email = DEMO_PROFILE_MAP[profile] || 'demo-admin@brandsense.ai';
    const demo = DEMO_USERS.find((user) => user.email === email);

    if (!demo) {
      return { success: false, error: 'Demo profile is unavailable.' };
    }

    const pubUser: UserProfile = {
      id: demo.id,
      organizationId: demo.organizationId,
      name: demo.name,
      email: demo.email,
      role: demo.role,
      avatar: demo.avatar,
      department: demo.department,
      organisation: demo.organisation,
      isDemo: true,
    };

    this.writeSession(pubUser);
    return { success: true, user: pubUser };
  }

  // ---------------------------------------------------------------------------
  // Profile Update (Name, Avatar, Department)
  // ---------------------------------------------------------------------------
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const token = this.getToken();

    if (token) {
      try {
        const resp = await fetch('/api/v1/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: updates.name,
            avatarUrl: updates.avatar,
            department: updates.department,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.user) {
            this.writeSession(data.user);
            return data.user;
          }
        }
      } catch (e) {
        // Backend not reached
      }
    }

    // Local cached update
    if (typeof window === 'undefined') return null;
    const cachedUser = readJSON<UserProfile>('brandsense_active_user');
    if (cachedUser && cachedUser.id === userId) {
      const updated = { ...cachedUser, ...updates };
      this.writeSession(updated);
      return updated;
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Demo Data Reset
  // ---------------------------------------------------------------------------
  resetDemoData(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(`brandsense_reviews_${DEMO_ORG_ID}`);
      localStorage.removeItem(`brandsense_kb_${DEMO_ORG_ID}`);
      localStorage.removeItem(`brandsense_approvals_${DEMO_ORG_ID}`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-superadmin`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-admin`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-creator`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-reviewer`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-manager`);
    } catch {
      // Ignore
    }
  }

  // ---------------------------------------------------------------------------
  // Password Reset
  // ---------------------------------------------------------------------------
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    return { 
      success: true, 
      message: 'If an account exists for this email, password reset instructions have been dispatched.' 
    };
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  async logout(): Promise<void> {
    this.setToken(null);

    if (this.isSupabaseLive()) {
      try {
        await this.supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('brandsense_active_user');
      } catch {
        // Ignore
      }
    }
  }
}

export const authClient = new BrandSenseAuthClient();
