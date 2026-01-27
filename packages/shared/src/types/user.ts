/**
 * User represents an editor or translator in the system.
 * Mirrors Supabase Auth profile used by both frontend and Letta logs.
 */
export interface User {
  /** Supabase auth UID */
  id: string;
  /** User email address */
  email: string;
  /** Role in the editorial workflow (editor or translator) */
  role: "editor" | "translator" | "admin";
  /** ISO timestamp of account creation */
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
