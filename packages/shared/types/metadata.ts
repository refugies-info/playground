/**
 * MetadataMapping represents validated metadata for a ContentItem.
 * Editors validate and map document metadata (pricing, dates, public status, etc.)
 * before publishing. This is a placeholder for Sprint 0; full implementation in Sprint 1.
 */
export interface MetadataMapping {
  /** Reference to ContentItem.id */
  contentId: string;
  /** Metadata field key (e.g., 'pricing', 'publicDate', 'isPublic') */
  key: string;
  /** Metadata field value */
  value: string;
  /** User ID who validated this metadata */
  validatedBy: string;
  /** ISO timestamp of validation */
  validatedAt: string;
}

/**
 * SupabaseEnv ensures quickstart + Next.js runtime share a typed contract for env parsing.
 */
export interface SupabaseEnv {
  /** Supabase project URL */
  url: string;
  /** Supabase anonymous key (public, for client-side reads) */
  anonKey: string;
  /** Supabase service role key (secret, for server-side writes) */
  serviceRoleKey: string;
}
