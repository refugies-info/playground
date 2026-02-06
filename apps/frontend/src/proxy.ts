import { updateSession } from "@playground/supabase";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Protected routes that require authentication
  // Added /translations
  const PROTECTED_ROUTES = [
    "/documents",
    "/profile",
    "/account-linking",
    "/translations",
  ];

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ["/login", "/signup", "/password-reset", "/callback"];

  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Handle root path "/"
  if (pathname === "/") {
    if (user) {
      // Determine dashboard based on role
      const role = user.user_metadata?.role;
      if (role === "translator") {
        return NextResponse.redirect(new URL("/translations", request.url));
      }
      return NextResponse.redirect(new URL("/documents", request.url));
    } else {
      // Allow PKCE flow (password recovery, email confirmation, etc.)
      const code = request.nextUrl.searchParams.get("code");
      if (code) {
        // Redirect to callback to exchange the code
        return NextResponse.redirect(
          new URL(`/auth/callback?code=${code}`, request.url),
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public auth route with session, redirect to documents (or translations if translator)
  // EXCEPT for password-reset (allow password reset even when authenticated)
  if (isPublicRoute && user && !pathname.startsWith("/password-reset")) {
    const role = user.user_metadata?.role;
    const target = role === "translator" ? "/translations" : "/documents";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Translator Access Control
  // Block access to /documents for translators
  if (user && pathname.startsWith("/documents")) {
    const role = user.user_metadata?.role;
    if (role === "translator") {
      return NextResponse.redirect(new URL("/translations", request.url));
    }
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
