import { Database } from './types';
import { getClientEnv } from '../env';

// Type-safe isomorphic Supabase Client
export interface SupabaseAuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  access_token: string;
  token_type: string;
}

export type AuthStateChangeCallback = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'TOKEN_REFRESHED' | string,
  session: SupabaseAuthSession | null
) => void | Promise<void>;

class SupabaseQueryBuilder {
  private table: string;
  private filters: Array<{ column: string; value: any }> = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    return this;
  }

  insert(values: any) {
    return this;
  }

  update(values: any) {
    return this;
  }

  delete() {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    return this;
  }

  limit(count: number) {
    return this;
  }

  async single(): Promise<{ data: any; error: any }> {
    return { data: null, error: null };
  }

  // Thenable to resolve as promise
  then(resolve: (val: { data: any[]; error: any }) => void) {
    resolve({ data: [], error: null });
  }
}

class SupabaseStorageBucket {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async upload(path: string, file: any, options?: { upsert?: boolean }) {
    return { data: { path }, error: null };
  }

  async createSignedUrl(path: string, expiresIn: number) {
    const token = Math.random().toString(36).substring(7);
    return {
      data: {
        signedUrl: `https://storage.brandsense.ai/${this.bucket}/${path}?token=${token}&expires=${expiresIn}`,
      },
      error: null,
    };
  }

  async remove(paths: string[]) {
    return { data: paths, error: null };
  }
}

export class BrandSenseSupabaseClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  auth = {
    getSession: async (): Promise<{ data: { session: SupabaseAuthSession | null }; error: any }> => {
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (callback: AuthStateChangeCallback) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },

    signUp: async ({ email, password, options }: any): Promise<{ data: any; error: any }> => {
      return {
        data: {
          user: { id: `usr-${Date.now()}`, email, user_metadata: options?.data || {} },
          session: null,
        },
        error: null,
      };
    },

    signInWithPassword: async ({ email, password }: any): Promise<{ data: any; error: any }> => {
      return {
        data: {
          user: { id: `usr-${Date.now()}`, email },
          session: {
            access_token: 'mock-access-token',
            token_type: 'bearer',
            user: { id: `usr-${Date.now()}`, email },
          },
        },
        error: null,
      };
    },

    signOut: async (): Promise<{ error: null }> => {
      return { error: null };
    },

    resetPasswordForEmail: async (email: string, options?: any): Promise<{ data: any; error: any }> => {
      return { data: {}, error: null };
    },
  };

  from(table: string): SupabaseQueryBuilder {
    return new SupabaseQueryBuilder(table);
  }

  storage = {
    from: (bucket: string): SupabaseStorageBucket => {
      return new SupabaseStorageBucket(bucket);
    },
  };
}

let browserClient: BrandSenseSupabaseClient | null = null;

export function getSupabaseBrowserClient(): BrandSenseSupabaseClient {
  if (browserClient) return browserClient;

  const { supabaseUrl, supabaseAnonKey } = getClientEnv();
  browserClient = new BrandSenseSupabaseClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );

  return browserClient;
}

export const supabase = getSupabaseBrowserClient();
