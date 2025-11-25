/**
 * User represents an editor or reviewer in the system.
 * Mirrors Supabase Auth profile used by both frontend and Letta logs.
 */
export interface User {
  /** Supabase auth UID */
  id: string;
  /** User email address */
  email: string;
  /** Display name for UI */
  displayName: string;
  /** Role in the editorial workflow (POC uses 'editor' only) */
  role: "editor" | "reviewer" | "admin";
  /** ISO timestamp of account creation */
  createdAt: string;
}
