/**
 * User represents an editor or reviewer in the system.
 * Mirrors Supabase Auth profile used by both frontend and Letta logs.
 */
export interface User {
  /** Supabase auth UID */
  id: string;
  /** User email address */
  email: string;
  /** Role in the editorial workflow (POC uses 'editor' only) */
  role: "editor" | "reviewer" | "admin";
  /** ISO timestamp of account creation */
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
