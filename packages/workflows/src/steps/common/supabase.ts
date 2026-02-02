import { getSupabaseAdmin } from "@playground/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client for use in workflow steps.
 * Uses service role key for elevated permissions required by background workflows.
 *
 * @returns Supabase client with admin privileges
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not defined
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}
