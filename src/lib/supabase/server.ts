import { cookies } from 'next/headers';
import { Database } from './types';
import { getClientEnv } from '../env';
import { BrandSenseSupabaseClient } from './client';

export interface CookieOptions {
  maxAge?: number;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

export function getSupabaseServerClient(): BrandSenseSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getClientEnv();
  return new BrandSenseSupabaseClient(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );
}
