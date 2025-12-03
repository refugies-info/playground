/**
 * Shared types for Content Playground
 * Exported for use across frontend and backend workspaces
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
  SupabaseEnv,
  UnlinkOAuthRequest,
  User,
} from "./src/types/auth";
export type {
  ContentItem,
  DocumentState,
  DocumentStatus,
  MockDocument,
} from "./src/types/document";
export type { User as UserType } from "./src/types/user";
