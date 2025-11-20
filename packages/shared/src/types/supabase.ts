/**
 * Supabase Configuration Types
 * Shared types for Supabase environment variables
 */

/**
 * Supabase environment configuration
 */
export interface SupabaseEnv {
  url: string; // Supabase project URL
  anonKey: string; // Publishable/anon key for client-side operations
  serviceRoleKey: string; // Service role key for server-side operations (never expose to client)
}
