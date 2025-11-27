/**
 * Current User API Route
 * GET /api/auth/user
 *
 * Returns the current authenticated user's information including ID, email, and role.
 * Requires valid authentication (Bearer token in Authorization header).
 */

import { type NextRequest, NextResponse } from "next/server";

import type { CurrentUserResponse } from "@shared";

import { getSupabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseServer();

    // Get current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session from token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: "Failed to retrieve session" },
        { status: 500 }
      );
    }

    // Build response
    const response: CurrentUserResponse = {
      user: {
        id: user.id,
        email: user.email || "",
        role: "editor", // TODO: Fetch from users table after database setup
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
      isAuthenticated: true,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
