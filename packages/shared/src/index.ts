/**
 * Shared Types and Constants
 * Exported from @content-playground/shared package
 */

// Auth types
export type {
  User,
  AuthSession,
  OAuthProvider,
  AuthError,
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  OAuthSignInResponse,
  LinkOAuthRequest,
  UnlinkOAuthRequest,
  CurrentUserResponse,
} from "./types/auth";

// Audit types
export type {
  AuditLog,
  EmailSignupDetails,
  EmailLoginDetails,
  GoogleLoginDetails,
  LogoutDetails,
  PasswordResetDetails,
  AccountLinkDetails,
  AccountUnlinkDetails,
  RoleChangeDetails,
  CreateAuditLogRequest,
  AuditLogQueryResponse,
} from "./types/audit";

export { AuditAction, AuditStatus } from "./types/audit";

// Supabase types
export type { SupabaseEnv } from "./types/supabase";

// Role constants and utilities
export {
  ROLES,
  ROLE_PERMISSIONS,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  hasPermission,
  getRolePermissions,
  getRoleDisplayName,
  getRoleDescription,
  isValidRole,
  getAllRoles,
} from "./constants/roles";

export type { Role } from "./constants/roles";
