import { UserProfile } from '@/types';

const USERS_KEY = 'brandsense_auth_users';
const SESSION_KEY = 'brandsense_auth_session';

export const AUTH_STORAGE_KEYS = [USERS_KEY, SESSION_KEY];

export type AuthField = 'name' | 'email' | 'password';

export type AuthResult =
  | { success: true; user: UserProfile }
  | { success: false; error: string; field?: AuthField };

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  organisation: string;
  role: string;
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

const ROLE_MAP: Record<string, UserProfile['role']> = {
  'Brand Manager': 'Manager',
  'Legal & Compliance': 'Reviewer',
  'Content Creator': 'Creator',
  'Marketing Director': 'Admin',
};

const DEPARTMENT_MAP: Record<string, string> = {
  'Brand Manager': 'Brand & Global Marketing',
  'Legal & Compliance': 'Legal & Compliance',
  'Content Creator': 'Content & Creative',
  'Marketing Director': 'Marketing Leadership',
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
    // Storage can be unavailable in private browsing; fail gracefully.
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

  async getSession(): Promise<UserProfile | null> {
    await this.ensureSeeded();
    const session = readJSON<StoredSession>(SESSION_KEY);
    if (!session) return null;

    const user = this.readUsers().find((candidate) => candidate.id === session.userId);
    if (!user) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(SESSION_KEY);
        } catch {
          // Ignore storage errors.
        }
      }
      return null;
    }

    return toPublicUser(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    await this.ensureSeeded();

    const normalized = normalizeEmail(email);
    if (!normalized || !password) {
      return { success: false, error: 'Enter your email address and password.', field: 'email' };
    }

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

  async register(input: RegisterInput): Promise<AuthResult> {
    await this.ensureSeeded();

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
      name,
      email,
      role: ROLE_MAP[input.role] ?? 'Manager',
      avatar: '',
      department: DEPARTMENT_MAP[input.role] ?? 'Brand & Global Marketing',
      organisation,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.writeUsers(users);

    return this.createSession(newUser);
  }

  async signInDemo(profile: DemoProfile): Promise<AuthResult> {
    await this.ensureSeeded();

    const email = DEMO_PROFILE_MAP[profile];
    const demo = DEMO_USERS.find((user) => user.email === email);
    if (!demo) {
      return { success: false, error: 'Demo access is unavailable. Please sign in manually.' };
    }

    return this.login(demo.email, demo.password);
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage errors.
    }
  }
}

export const authClient = new BrandSenseAuthClient();
