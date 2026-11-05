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



export type DemoProfile = 'manager' | 'legal' | 'okta' | 'google';



interface StoredUser extends UserProfile {

  passwordHash: string;

  createdAt: string;

}



interface StoredSession {

  userId: string;

  email: string;

  issuedAt: number;

}



const DEMO_AVATAR =

  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

const LEGAL_AVATAR =

  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';



const DEMO_USERS: Array<Omit<StoredUser, 'passwordHash' | 'createdAt'> & { password: string }> = [

  {

    id: 'usr-1',

    organizationId: 'org-1',

    name: 'Elena Rostova',

    email: 'elena.rostova@acmebrand.com',

    role: 'Manager',

    avatar: DEMO_AVATAR,

    department: 'Brand & Global Marketing',

    organisation: 'Acme Enterprise Holdings',

    password: 'brandsense-demo',

  },

  {

    id: 'usr-2',

    organizationId: 'org-1',

    name: 'Sarah Chen, Esq.',

    email: 'sarah.chen@acmebrand.com',

    role: 'Reviewer',

    avatar: LEGAL_AVATAR,

    department: 'Legal & Compliance',

    organisation: 'Acme Enterprise Holdings',

    password: 'legal-demo',

  },

];



const DEMO_PROFILE_MAP: Record<DemoProfile, string> = {

  manager: 'elena.rostova@acmebrand.com',

  legal: 'sarah.chen@acmebrand.com',

  okta: 'elena.rostova@acmebrand.com',

  google: 'elena.rostova@acmebrand.com',

};



const normalizeEmail = (email: string) => email.trim().toLowerCase();



const hashPassword = async (password: string): Promise<string> => {

  if (typeof crypto !== 'undefined' && crypto.subtle) {

    const data = new TextEncoder().encode(`brandsense:${password}`);

    const digest = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(digest))

      .map((byte) => byte.toString(16).padStart(2, '0'))

      .join('');

  }

  let hash = 0;

  const value = `brandsense:${password}`;

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

    // Ignore storage issues

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



  private isSupabaseLive(): boolean {

    return getClientEnv().isConfigured;

  }



  private isDemoAllowed(): boolean {

    if (this.isSupabaseLive()) return false;

    return process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true';

  }



  private readUsers(): StoredUser[] {

    return readJSON<StoredUser[]>(USERS_KEY) ?? [];

  }



  private writeUsers(users: StoredUser[]) {

    writeJSON(USERS_KEY, users);

  }



  private ensureSeeded(): Promise<void> {

    if (this.readUsers().length === 0) {

      this.seedPromise = null;

    }

    if (!this.seedPromise) this.seedPromise = this.seedDemoUsers();

    return this.seedPromise;

  }



  private async seedDemoUsers(): Promise<void> {

    const users = this.readUsers();

    let changed = false;



    for (const demo of DEMO_USERS) {

      const exists = users.some((user) => user.email === demo.email);

      if (exists) continue;



      const { password, ...profile } = demo;

      users.push({

        ...profile,

        passwordHash: await hashPassword(password),

        createdAt: new Date().toISOString(),

      });

      changed = true;

    }



    if (changed) this.writeUsers(users);

  }



  private writeSession(user: StoredUser) {

    const session: StoredSession = {

      userId: user.id,

      email: user.email,

      issuedAt: Date.now(),

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

      const orgName = profileData.organizations?.name || 'Acme Enterprise Holdings';



      return {

        id: profileData.id,

        organizationId: profileData.organization_id,

        name: profileData.full_name,

        email: profileData.email,

        role: profileData.role as UserProfile['role'],

        avatar: profileData.avatar_url || DEMO_AVATAR,

        department: profileData.department || 'Brand & Global Marketing',

        organisation: orgName,

      };

    } catch {

      return null;

    }

  }



  // ---------------------------------------------------------------------------

  // Session Handling

  // ---------------------------------------------------------------------------

  async getSession(): Promise<UserProfile | null> {

    if (this.isSupabaseLive()) {

      try {

        const { data: { session }, error } = await this.supabase.auth.getSession();

        if (session && !error) {

          let profile = await this.fetchUserProfile(session.user.id);

          if (!profile) {

            // Brief retry in case profile trigger is executing

            await new Promise((r) => setTimeout(r, 600));

            profile = await this.fetchUserProfile(session.user.id);

          }

          // Never grant Admin or construct privileged fallback based on metadata

          return profile;

        }

      } catch (err) {

        console.warn('Supabase getSession failed:', err);

      }

      return null;

    }



    // Local development fallback

    if (!this.isDemoAllowed()) {

      return null;

    }



    await this.ensureSeeded();

    const session = readJSON<StoredSession>(SESSION_KEY);

    if (!session) return null;



    const user = this.readUsers().find((candidate) => candidate.id === session.userId);

    if (!user) {

      if (typeof window !== 'undefined') {

        try {

          localStorage.removeItem(SESSION_KEY);

        } catch {

          // Ignore

        }

      }

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



    if (this.isSupabaseLive()) {

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

          // Require an actual public.profiles record

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



    // Local development authentication

    if (!this.isDemoAllowed()) {

      return {

        success: false,

        error: 'Live Supabase credentials are required. Demo authentication is disabled in production.',

        field: 'email',

      };

    }



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

  // Register / Onboarding

  // ---------------------------------------------------------------------------

  async register(input: RegisterInput): Promise<AuthResult> {

    const name = input.name.trim();

    const email = normalizeEmail(input.email);

    const password = input.password;

    const organisation = input.organisation.trim() || 'Acme Enterprise Holdings';



    if (name.length < 2) {

      return { success: false, error: 'Enter your full name.', field: 'name' };

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

      return { success: false, error: 'Enter a valid email address.', field: 'email' };

    }

    if (password.length < 8) {

      return { success: false, error: 'Password must be at least 8 characters.', field: 'password' };

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

          // If session was returned immediately (email confirmation off)

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

            department: 'Brand & Global Marketing',

            organisation,

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



    // Local development fallback

    if (!this.isDemoAllowed()) {

      return {

        success: false,

        error: 'Live Supabase credentials are required. Demo registration is disabled in production.',

        field: 'email',

      };

    }



    await this.ensureSeeded();

    const users = this.readUsers();

    if (users.some((user) => user.email === email)) {

      return {

        success: false,

        error: 'An account with this email already exists. Sign in instead.',

        field: 'email',

      };

    }



    const newUser: StoredUser = {

      id: `usr-${Date.now()}`,

      organizationId: `org-${Date.now()}`,

      name,

      email,

      role: 'Creator',

      avatar: '',

      department: 'Brand & Global Marketing',

      organisation,

      passwordHash: await hashPassword(password),

      createdAt: new Date().toISOString(),

    };



    users.push(newUser);

    this.writeUsers(users);

    return this.createSession(newUser);

  }



  // ---------------------------------------------------------------------------

  // Demo Login

  // ---------------------------------------------------------------------------

  async signInDemo(profile: DemoProfile): Promise<AuthResult> {

    if (!this.isDemoAllowed()) {

      return {

        success: false,

        error: 'Demo sign-in is disabled in production environments. Please sign in with enterprise credentials.',

      };

    }



    await this.ensureSeeded();

    const email = DEMO_PROFILE_MAP[profile];

    const demo = DEMO_USERS.find((user) => user.email === email);

    if (!demo) {

      return { success: false, error: 'Demo access is unavailable. Please sign in manually.' };

    }



    const user = this.readUsers().find((candidate) => candidate.email === email);

    if (user) {

      return this.createSession(user);

    }



    return this.createSession({

      ...demo,

      passwordHash: await hashPassword(demo.password),

      createdAt: new Date().toISOString(),

    });

  }



  // ---------------------------------------------------------------------------

  // Password Reset

  // ---------------------------------------------------------------------------

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {

    const normalized = normalizeEmail(email);

    if (!normalized) {

      return { success: false, message: 'Please enter a valid email address.' };

    }



    if (this.isSupabaseLive()) {

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

