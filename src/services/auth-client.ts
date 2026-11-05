import { UserProfile } from '@/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getClientEnv } from '@/lib/env';

const USERS_KEY = 'brandsense_auth_users';
const SESSION_KEY = 'brandsense_auth_session';

export const AUTH_STORAGE_KEYS = [USERS_KEY, SESSION_KEY];

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

export type DemoProfile = 'manager' | 'legal' | 'creator' | 'admin' | 'okta' | 'google';

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

const DEMO_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
const LEGAL_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
const CREATOR_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
const ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';

export const DEMO_ORG_ID = 'org-demo-brandsense';

export const DEMO_USERS: Array<Omit<StoredUser, 'passwordHash' | 'createdAt'> & { password: string }> = [
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
  {
    id: 'usr-demo-legal',
    organizationId: DEMO_ORG_ID,
    name: 'Sarah Chen, Esq. (Demo Legal)',
    email: 'demo-legal@brandsense.ai',
    role: 'Reviewer',
    avatar: LEGAL_AVATAR,
    department: 'Legal & Regulatory Compliance',
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
    id: 'usr-demo-admin',
    organizationId: DEMO_ORG_ID,
    name: 'Julian Thorne (Demo Admin)',
    email: 'demo-admin@brandsense.ai',
    role: 'Admin',
    avatar: ADMIN_AVATAR,
    department: 'Executive Governance',
    organisation: 'BrandSense Demo Corp',
    isDemo: true,
    password: 'demo-password-123',
  },
];

const DEMO_PROFILE_MAP: Record<DemoProfile, string> = {
  manager: 'demo-manager@brandsense.ai',
  legal: 'demo-legal@brandsense.ai',
  creator: 'demo-creator@brandsense.ai',
  admin: 'demo-admin@brandsense.ai',
  okta: 'demo-manager@brandsense.ai',
  google: 'demo-manager@brandsense.ai',
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

  private writeSession(user: StoredUser) {
    const session: StoredSession = {
      userId: user.id,
      email: user.email,
      issuedAt: Date.now(),
      isDemo: Boolean(user.isDemo),
    };
    writeJSON(SESSION_KEY, session);
  }

  private async createSession(user: StoredUser): Promise<AuthResult> {
    this.writeSession(user);
    return { success: true, user: toPublicUser(user) };
  }

  // ---------------------------------------------------------------------------
  // Profile Fetcher
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
    // 1. Supabase live session check
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

    // 2. Local storage session check
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
  // Login
  // ---------------------------------------------------------------------------
  async login(email: string, password: string): Promise<AuthResult> {
    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
      return { success: false, error: 'Enter your email address and password.', field: 'email' };
    }

    // 1. If Supabase is live and this is NOT a demo account email, authenticate with Supabase
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
              error: 'User profile not found in public.profiles. Please contact your organization administrator.',
              field: 'email',
            };
          }

          return { success: true, user: profile };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Sign in failed.', field: 'email' };
      }
    }

    // 2. Local authentication (Demo users or local registered users)
    await this.ensureSeeded();
    const user = this.readUsers().find((candidate) => candidate.email === normalized);
    if (!user) {
      return { success: false, error: 'No account was found for this email address.', field: 'email' };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Incorrect password. Please try again.', field: 'password' };
    }

    return this.createSession(user);
  }

  // ---------------------------------------------------------------------------
  // Register / Onboarding (Real User Accounts)
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
      return { success: false, error: 'Reserved email prefix. Please use your company email.', field: 'email' };
    }

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
          if (data.session) {
            let profile = await this.fetchUserProfile(data.user.id);
            if (!profile) {
              await new Promise((r) => setTimeout(r, 800));
              profile = await this.fetchUserProfile(data.user.id);
            }
            if (profile) return { success: true, user: profile };
          }

          const newUser: UserProfile = {
            id: data.user.id,
            name,
            email,
            role: 'Creator',
            avatar: '',
            department: 'Brand & Marketing',
            organisation,
            isDemo: false,
          };

          return { 
            success: true, 
            user: newUser, 
            message: 'Account created! Please check your email to verify your address if required.' 
          };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed.', field: 'email' };
      }
    }

    // Local registration with user data isolation
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
      role: (input.role as UserProfile['role']) || 'Creator',
      avatar: '',
      department: 'Brand & Global Marketing',
      organisation,
      isDemo: false,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.writeUsers(users);

    return this.createSession(newUser);
  }

  // ---------------------------------------------------------------------------
  // Demo Login (Isolated Demo Users)
  // ---------------------------------------------------------------------------
  async signInDemo(profile: DemoProfile): Promise<AuthResult> {
    await this.ensureSeeded();
    const email = DEMO_PROFILE_MAP[profile] || 'demo-manager@brandsense.ai';
    const demo = DEMO_USERS.find((user) => user.email === email);

    if (!demo) {
      return { success: false, error: 'Demo profile is unavailable.' };
    }

    const users = this.readUsers();
    let user = users.find((candidate) => candidate.email === email);

    if (!user) {
      const passwordHash = await hashPassword(demo.password);
      user = {
        ...demo,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      this.writeUsers(users);
    }

    return this.createSession(user);
  }

  // ---------------------------------------------------------------------------
  // Profile Update
  // ---------------------------------------------------------------------------
  updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const users = this.readUsers();
    const idx = users.findIndex((u) => u.id === userId);
    
    if (idx >= 0) {
      users[idx] = {
        ...users[idx],
        ...updates,
      };
      this.writeUsers(users);
      
      const session = readJSON<StoredSession>(SESSION_KEY);
      if (session && session.userId === userId) {
        writeJSON(SESSION_KEY, { ...session, ...updates });
      }
      return toPublicUser(users[idx]);
    } else {
      // Handle demo user profile update
      const demoUser = DEMO_USERS.find((d) => d.id === userId);
      if (demoUser) {
        const newUser: StoredUser = {
          ...demoUser,
          ...updates,
          passwordHash: '',
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        this.writeUsers(users);
        const session = readJSON<StoredSession>(SESSION_KEY);
        if (session && session.userId === userId) {
          writeJSON(SESSION_KEY, { ...session, ...updates });
        }
        return toPublicUser(newUser);
      }
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
      localStorage.removeItem(`brandsense_current_review_usr-demo-manager`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-legal`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-creator`);
      localStorage.removeItem(`brandsense_current_review_usr-demo-admin`);
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

    if (this.isSupabaseLive() && !normalized.startsWith('demo-')) {
      try {
        const { error } = await this.supabase.auth.resetPasswordForEmail(normalized, {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined,
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Password reset link sent to your email.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to send reset link.' };
      }
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
      } catch {
        // Ignore
      }
    }
  }
}

export const authClient = new BrandSenseAuthClient();
