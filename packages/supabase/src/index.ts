import type { SupabaseEnv } from "@playground/shared-types";
import { createClient } from "@supabase/supabase-js";

/**
 * Parse and validate Supabase environment variables
 * Lazy initialization to avoid build-time errors when env vars are missing
 * Supports both legacy (ANON_KEY) and new (PUBLISHABLE_KEY) formats
 */
function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Support both legacy and new key formats
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Return defaults if missing (will fail at runtime if actually used)
  return {
    url: url || "https://placeholder.supabase.co",
    anonKey: anonKey || "placeholder-publishable-key",
    serviceRoleKey: serviceRoleKey || "",
  };
}

const env = getSupabaseEnv();

/**
 * Client-side Supabase client (anon key)
 * Use for read operations in components and client-side code.
 * Row-level security (RLS) enforces access control.
 */
export const supabaseClient = createClient(env.url, env.anonKey, {
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
export const getSupabaseServer = () => {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for server-side operations",
    );
  }

  return createClient(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};


/**
 * Create a Supabase client for use in scripts (Node.js environment)
 * Allows passing credentials explicitly or falling back to environment variables.
 *
 * @param url - Supabase URL (optional, defaults to SUPABASE_URL env var)
 * @param key - Supabase Service Role Key (optional, defaults to SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY env var)
 */
export const createScriptClient = (url?: string, key?: string) => {
  const supabaseUrl = url || process.env.SUPABASE_URL;
  const supabaseKey =
    key ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Key are required. Pass them as arguments or set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
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

export type { SupabaseEnv };
