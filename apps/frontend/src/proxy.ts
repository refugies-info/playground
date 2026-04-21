import { updateSession } from "@playground/supabase";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, connectionError } =
    await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // If Supabase is unreachable, redirect to the service unavailable page.
  // We avoid redirecting if already on that page to prevent redirect loops.
  // We also skip /auth/* routes (callback, etc.) since they handle their own
  // auth flow and must be reachable even when Supabase is momentarily busy.
  if (
    connectionError &&
    !pathname.startsWith("/service-unavailable") &&
    !pathname.startsWith("/auth/")
  ) {
    const response = NextResponse.redirect(
      new URL("/service-unavailable", request.url),
    );
    // Clear auth cookies to prevent the user from being permanently stuck:
    // a stale session cookie would cause every subsequent request to fail
    // the same way, looping back to /service-unavailable.
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.includes("auth-token")) {
        response.cookies.delete(cookie.name);
      }
    }
    return response;
  }

  // Protected routes that require authentication
  // Added /translations
  const PROTECTED_ROUTES = [
    "/documents",
    "/profile",
    "/account-linking",
    "/translations",
  ];

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = [
    "/login",
    "/signup",
    "/password-reset",
    "/accept-invite",
    "/callback",
    "/service-unavailable",
  ];

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Handle root path "/"
  if (pathname === "/") {
    if (!user) {
      // Allow PKCE flow (password recovery, email confirmation, etc.)
      // Forward all query params (code, type, etc.) so the callback can route correctly.
      const code = request.nextUrl.searchParams.get("code");
      if (code) {
        return NextResponse.redirect(
          new URL(
            `/auth/callback?${request.nextUrl.searchParams.toString()}`,
            request.url,
          ),
        );
      }
      // Invite flow: Supabase redirects to root with type=invite in query params
      const type = request.nextUrl.searchParams.get("type");
      if (type === "invite") {
        return NextResponse.redirect(new URL("/accept-invite", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Authenticated users: let /app/(main)/page.tsx handle role-based routing
    // (it queries profiles.role and redirects to /documents or /translations)
    return supabaseResponse;
  }

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public auth route with session, redirect to / (role-based routing)
  // EXCEPT for password-reset and accept-invite (allow these flows even when authenticated)
  if (
    isPublicRoute &&
    user &&
    !pathname.startsWith("/password-reset") &&
    !pathname.startsWith("/accept-invite")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
