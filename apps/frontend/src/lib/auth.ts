/**
 * Authentication Utility Functions
 * Helper functions for auth operations using Supabase client
 */

import type {
  User,
  AuthSession,
  SignUpRequest,
  SignInRequest,
  CurrentUserResponse,
} from "@shared";

import { supabaseClient } from "./supabase";

/**
 * Sign up with email and password
 */
export async function signUp(request: SignUpRequest): Promise<{
  user: User | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: request.email,
      password: request.password,
    });

    if (error) {
      return { user: null, error };
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email || "",
            role: "editor", // Default role for new users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          }
        : null,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Sign up failed"),
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(request: SignInRequest): Promise<{
  session: AuthSession | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

    if (error) {
      return { session: null, error };
    }

    return {
      session: data.session
        ? {
            id: data.session.user.id,
            user_id: data.session.user.id,
            token: data.session.access_token,
            expires_at: new Date(data.session.expires_at! * 1000).toISOString(),
            created_at: new Date().toISOString(),
          }
        : null,
      error: null,
    };
  } catch (error) {
    return {
      session: null,
      error: error instanceof Error ? error : new Error("Sign in failed"),
    };
  }
}

/**
 * Sign out and clear session
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("Sign out failed"),
    };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return {
        user: null,
        session: null,
        isAuthenticated: false,
      };
    }

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    return {
      user: {
        id: user.id,
        email: user.email || "",
        role: "editor", // TODO: Fetch from users table
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        is_active: true,
      },
      session: session
        ? {
            id: session.user.id,
            user_id: session.user.id,
            token: session.access_token,
            expires_at: new Date(session.expires_at! * 1000).toISOString(),
            created_at: new Date().toISOString(),
          }
        : null,
      isAuthenticated: !!user,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Get user role
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return null;
    }

    // TODO: Fetch from users table
    return "editor";
  } catch {
    return null;
  }
}

/**
 * Request password reset
 */
export async function resetPassword(email: string): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/password-reset`,
    });

    return { error };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error("Password reset failed"),
    };
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password,
    });

    return { error };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error("Password update failed"),
    };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: "google"): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error("OAuth sign in failed"),
    };
  }
}
