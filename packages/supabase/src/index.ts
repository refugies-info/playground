import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-publishable-key";

/**
 * Client-side Supabase client (anon key)
 * Use for read operations in components and client-side code.
 * Row-level security (RLS) enforces access control.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js/web",
    },
  },
});

/**
 * Server-side Supabase client (service role key)
 * Use ONLY in Next.js API routes for write operations.
 * NEVER expose this key to the client.
 *
 * This is only exported for use in API routes (server-side only).
 * Do NOT import this in client components.
 */
/**
 * Server-side Supabase client (service role key)
 * Use for scripts and API routes that need admin privileges.
 * NEVER expose this key to the client.
 *
 * @param url - Supabase URL (optional, defaults to SUPABASE_URL env var)
 * @param serviceRoleKey - Supabase Service Role Key (optional, defaults to SUPABASE_SERVICE_ROLE_KEY env var)
 */
export const getSupabaseAdmin = (url?: string, serviceRoleKey?: string) => {
  const supabaseUrl =
    url || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    serviceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Service Role Key are required. Pass them as arguments or set SUPABASE_SERVICE_ROLE_KEY environment variable.",
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
