/**
 * Next.js Middleware for Route Protection
 * Protects authenticated routes and redirects unauthenticated users to login
 */

import { type NextRequest, NextResponse } from "next/server";

/**
 * Protected routes that require authentication
 */
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/account-linking"];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/login", "/signup", "/password-reset", "/callback"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Get session token from cookies
  const sessionToken = request.cookies.get("sb-auth-token")?.value;

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public auth route with session, redirect to dashboard
  // EXCEPT for password-reset (allow password reset even when authenticated)
  if (
    isPublicRoute &&
    sessionToken &&
    !pathname.startsWith("/password-reset")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
