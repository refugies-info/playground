import {
  type CookieOptions,
  createBrowserClient,
  createServerClient,
} from "@supabase/ssr";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { type Database } from "./types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-publishable-key";

/**
 * Create a Supabase client for use in the browser (Client Components)
 */
export const createSupabaseBrowserClient = (): SupabaseClient<Database> => {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

/**
 * Create a Supabase client for use in the server (Server Components, Actions, API Routes)
 * @param cookieStore - The Next.js cookie store (from `cookies()`)
 */
// biome-ignore lint/suspicious/noExplicitAny: cookieStore comes from next/headers which is not available here
export const createSupabaseServerClient = (
  cookieStore: any
): SupabaseClient<Database> => {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

/**
 * Server-side Supabase client (service role key)
 * Use for scripts and API routes that need admin privileges.
 * NEVER expose this key to the client.
 *
 * @param url - Supabase URL (optional, defaults to SUPABASE_URL env var)
 * @param serviceRoleKey - Supabase Service Role Key (optional, defaults to SUPABASE_SERVICE_ROLE_KEY env var)
 */
export const getSupabaseAdmin = (
  url?: string,
  serviceRoleKey?: string
): SupabaseClient<Database> => {
  const supabaseUrl =
    url || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    serviceRoleKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL and Service Role Key are required. Pass them as arguments or set SUPABASE_SERVICE_ROLE_KEY environment variable."
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
