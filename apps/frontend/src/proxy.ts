import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@playground/supabase";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Protected routes that require authentication
  const PROTECTED_ROUTES = [
    "/dashboard",
    "/documents",
    "/profile",
    "/account-linking",
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
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing public auth route with session, redirect to dashboard
  // EXCEPT for password-reset (allow password reset even when authenticated)
  if (isPublicRoute && user && !pathname.startsWith("/password-reset")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
