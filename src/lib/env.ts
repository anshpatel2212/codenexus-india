/**
 * Environment Variable Validation for BrandSense
 */

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  isConfigured: boolean;
}

export function getClientEnv(): EnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    apiUrl,
    isConfigured,
  };
}

