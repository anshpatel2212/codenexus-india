import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';
import { getClientEnv } from '../env';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { supabaseUrl, supabaseAnonKey } = getClientEnv();

  // Return a safe client with provided or fallback config
  browserClient = createBrowserClient<Database>(
    supabaseUrl || 'https://placeholder-project.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );

  return browserClient;
}

export const supabase = getSupabaseBrowserClient();

