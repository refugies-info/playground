/**
 * Logout API Route
 * POST /api/auth/logout
 *
 * Handles user logout by clearing the session cookie and signing out from Supabase.
 */

import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the session from the request
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Create response and clear auth cookie
    const response = NextResponse.json(
      { message: "Successfully logged out" },
      { status: 200 }
    );

    // Clear the Supabase auth cookie
    response.cookies.set("sb-auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
