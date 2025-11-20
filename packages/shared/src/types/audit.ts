/**
 * Audit Logging Types
 * Shared types for tracking authentication and authorization events
 */

/**
 * Audit log action types
 */
export enum AuditAction {
  EMAIL_SIGNUP = "email_signup",
  EMAIL_LOGIN = "email_login",
  GOOGLE_LOGIN = "google_login",
  LOGOUT = "logout",
  PASSWORD_RESET = "password_reset",
  ACCOUNT_LINK = "account_link",
  ACCOUNT_UNLINK = "account_unlink",
  ROLE_CHANGE = "role_change",
}

/**
 * Audit log status
 */
export enum AuditStatus {
  SUCCESS = "success",
  FAILURE = "failure",
}

/**
 * Audit log entry tracking authentication and authorization events
 */
export interface AuditLog {
  id: string; // UUID
  user_id: string; // FK to User
  action: AuditAction | string; // Action performed
  status: AuditStatus | string; // Success or failure
  details: Record<string, any>; // Additional context (IP, user agent, error message, etc.)
  created_at: string; // ISO 8601 timestamp
}

/**
 * Audit log details for email signup
 */
export interface EmailSignupDetails {
  email: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

/**
 * Audit log details for email login
 */
export interface EmailLoginDetails {
  email: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

/**
 * Audit log details for Google login
 */
export interface GoogleLoginDetails {
  provider_email: string;
  provider_user_id: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  is_new_user?: boolean;
}

/**
 * Audit log details for logout
 */
export interface LogoutDetails {
  ip_address?: string;
  user_agent?: string;
}

/**
 * Audit log details for password reset
 */
export interface PasswordResetDetails {
  email: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

/**
 * Audit log details for account linking
 */
export interface AccountLinkDetails {
  provider: string;
  provider_email: string;
  provider_user_id: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

/**
 * Audit log details for account unlinking
 */
export interface AccountUnlinkDetails {
  provider: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
}

/**
 * Audit log details for role change
 */
export interface RoleChangeDetails {
  old_role: string;
  new_role: string;
  changed_by_user_id: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create audit log request
 */
export interface CreateAuditLogRequest {
  user_id: string;
  action: AuditAction | string;
  status: AuditStatus | string;
  details: Record<string, any>;
}

/**
 * Audit log query response
 */
export interface AuditLogQueryResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
