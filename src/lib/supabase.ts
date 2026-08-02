// Browser-side Supabase client. Uses the public anon key — safe to expose;
// Row Level Security (RLS) policies in Postgres are what actually enforce
// who can read/write what (see supabase/schema.sql).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// A single shared instance for client components that don't need a fresh
// one per request (most of this app — it's all client-rendered).
export const supabase = createClient();

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
