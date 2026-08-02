// Server-only Supabase client using the service role key, which bypasses
// Row Level Security entirely. Only import this from API routes — never
// from a "use client" component.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
