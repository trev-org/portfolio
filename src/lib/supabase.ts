import { createClient as supabaseCreateClient, SupabaseClient } from "@supabase/supabase-js";

// Create a single instance that will be reused across the app
let supabaseInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = supabaseCreateClient(supabaseUrl, supabaseAnonKey);

  return supabaseInstance;
}
