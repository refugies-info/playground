/**
 * Shared Types
 * Central export point for all type definitions
 */

export type {
  AuthError,
  AuthSession,
  CurrentUserResponse,
  LinkOAuthRequest,
  OAuthProvider,
  OAuthSignInResponse,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  UnlinkOAuthRequest,
  User,
} from "./auth";
export type { DocumentState, DocumentStatus, MockDocument } from "./document";
export type { User as UserType } from "./user";
