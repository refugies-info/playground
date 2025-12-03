/**
 * Authentication and Authorization Types
 * Shared types for Supabase Auth integration
 */

/**
 * User entity representing an authenticated user in the system
 */
export interface User {
  id: string; // UUID from Supabase Auth
  email: string;
  role: "editor" | "admin";
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  is_active: boolean;
}

/**
 * Authentication session tracking JWT tokens and expiration
 */
export interface AuthSession {
  id: string; // UUID
  user_id: string; // FK to User
  token: string; // JWT token
  expires_at: string | undefined; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
}

/**
 * OAuth provider linking for account linking (e.g., Google OAuth)
 */
export interface OAuthProvider {
  id: string; // UUID
  user_id: string; // FK to User
  provider: "google"; // Enum of supported providers
  provider_user_id: string; // User ID from OAuth provider
  provider_email: string; // Email from OAuth provider
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Authentication error response
 */
export interface AuthError {
  code: string; // Error code (e.g., 'invalid_credentials', 'user_not_found')
  message: string; // Human-readable error message
}

/**
 * Sign up request payload
 */
export interface SignUpRequest {
  email: string;
  password: string;
}

/**
 * Sign in request payload
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Sign in response with user and session data
 */
export interface SignInResponse {
  user: User;
  session: AuthSession;
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation payload
 */
export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

/**
 * OAuth sign in response
 */
export interface OAuthSignInResponse {
  user: User;
  session: AuthSession;
  isNewUser: boolean; // Whether this is a new account or existing
  linkedProvider?: OAuthProvider; // If account was linked to existing user
}

/**
 * Account linking request
 */
export interface LinkOAuthRequest {
  provider: "google";
}

/**
 * Account unlinking request
 */
export interface UnlinkOAuthRequest {
  provider: "google";
}

/**
 * Current user response
 */
export interface CurrentUserResponse {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
}

/**
 * Supabase environment variables interface
 */
export interface SupabaseEnv {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}
